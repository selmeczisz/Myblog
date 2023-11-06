import { deleteObject, ref } from "firebase/storage";
import { auth, db, storage } from "./firebaseApp";
import {collection,addDoc,serverTimestamp, query, orderBy, onSnapshot, where, doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, limit, getDocs} from 'firebase/firestore'
import { deleteAvatar } from "./uploadFile";
import { deleteUser } from "firebase/auth";

export const addPost=async (formData)=>{
    console.log(formData);
    const collectionRef=collection(db,'posts')
    const newItem={...formData,timestamp:serverTimestamp()}
    const newDocRef=await addDoc(collectionRef,newItem)
}

export const readPosts=async (setPosts,selectedCategories)=>{
    const collectionRef=collection(db,'posts')
    const q=selectedCategories.length==0 ?  query(collectionRef,orderBy('timestamp','desc')) :
                                            query(collectionRef,where('category','in',selectedCategories))
    const unsubscribe=onSnapshot(q,(snapshot)=>{
        setPosts(snapshot.docs.map(doc=>({...doc.data(),id:doc.id})))
    })
    return unsubscribe
}

export const readPost=async (id,setPost, setLikes=null)=>{
    const docRef=doc(db,"posts",id)
    try{
        const docSnap=await getDoc(docRef)
        if(docSnap.exists()){
            setPost({...docSnap.data(),id:docSnap.id})
           setLikes && setLikes(docSnap.data().likes.length)
        }else
            console.log('A dokumentum nem létezik!');
    }catch(err){
        console.log(err);
    }
}

export const editPost=async (id,{title, category, description})=>{
    const docRef=doc(db,"posts",id)
    await updateDoc(docRef, {title, category, description})
}

export const deleteFile=async (url)=>{
    console.log(url);
    const fileRef=ref(storage, url)
    try {
        await deleteObject(fileRef)
        return true
    } catch (error) {
        console.log('Delete file függvény ',error);
        return false
    }
}

export const deletePost=async (id)=>{
    console.log(id);
    const docRef=doc(db,"posts",id)
    await deleteDoc(docRef)

}
export const editLikes= async(postId, userId) =>{
    const docRef=doc(db,"posts",postId)
    const docSnap= await getDoc(docRef)
    //console.log(docSnap.data().likes.indexOf(userId));
    let likesCount=docSnap.data().likes.length

    if(docSnap.data().likes.indexOf(userId)==-1){
        likesCount++
        await updateDoc(docRef, {likes:arrayUnion(userId),likesCount})
        
    }else{
        likesCount--
        await updateDoc(docRef, {likes:arrayRemove(userId), likesCount})
        
    }   
        return likesCount

}

export const popularPosts=(setPosts)=>{
    const collectionRef=collection(db,'posts')
    const q=query(collectionRef, orderBy('likesCount','desc'), limit(3))
    const unsubscribe=onSnapshot(q,(snapshot)=>{
    setPosts(snapshot.docs.map(doc=>({...doc.data(),id:doc.id})))
    })
    return unsubscribe


}

//Felhasználói fiók törlése
export const deletePostsByAuthor = async (userId)=>{
    const postsRef=collection(db,'posts')
    const q=query(postsRef, where('userId', '==', userId))
    const querySnapshot=await getDocs(q)
    querySnapshot.forEach(async(d)=>{
        const id=d.id
        const docRef=doc(db, 'posts', id)
        const querySnap=await getDoc(docRef)
        deleteFile(querySnap.data().photoUrl)

        deleteDoc(docRef)
    })

}

const deleteAccount = async ()=>{
    try {
        const user=auth.currentUser
        if(user){
            await deleteUser(user)
        }else
            console.log('Nincs bejelentkezett felhasználó');
    } catch (error) {
        console.log(error);
    }
}

export const deleteProfile = async (userId)=>{
    // a postok törlése
        await deletePostsByAuthor(userId)
    
    // avatar törlése
    await deleteAvatar(userId)
    // user törlése - nem működik
    await deleteAccount()
    }

    export const readPostsRows = (setRows) =>{
        const collectionRef=collection(db,'posts')
        const q=query(collectionRef,orderBy('timestamp','desc')) 
        const unsubscribe=onSnapshot(q,(snapshot)=>{
            setRows(snapshot.docs.map(doc=>({title:doc.data().title, author:doc.data().author, 
                userId:doc.data().userId, id:doc.id})))
        })
        return unsubscribe

    }

export const deleteSelectedPosts = async (selection)=>{
    selection.map(async (id)=>{
        const docRef=doc(db,'posts', id)
        const docSnap=await getDoc(docRef)
        const photoUrl= docSnap.data().photoUrl
        await deletePost(id)
        await deleteFile(photoUrl)

    })
}