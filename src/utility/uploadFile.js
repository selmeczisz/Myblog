import {storage} from './firebaseApp';
import {ref,uploadBytes,getDownloadURL, list, deleteObject} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile=async (file)=>{
    try{
        const fileRef=ref(storage,`uploads/${uuidv4()+file.name.slice(-4)}`)
        console.log(`uploads/${uuidv4()+file.name.slice(-4)}`);
        await uploadBytes(fileRef,file)
        const photoUrl=await getDownloadURL(fileRef)
        return photoUrl
    }catch(err){
        console.log('Hiba a fájlfeltöltés során:',err);
        throw err
    }

}

export const uploadAvatar = async (file, userId)=>{
    try {
        const storageRef=ref(storage, 'avatars/') //referencia avatars mappára
        const results=await list(storageRef)
        console.log(results.items);
        const filesRef=results.items
        //console.log(filesRef[0]);
        if(filesRef[0]){
            const fRef=filesRef[0]
            const downloadUrl=await getDownloadURL(fRef)
            if (downloadUrl.indexOf(userId)!=-1) {
                await deleteObject(fRef, downloadUrl)
            }
        }
    } catch (error) {
        console.log(error);
    }


    // új file feltöltése
    try{
        const fileRef=ref(storage,`avatars/${userId+file.name.slice(-4)}`)
        await uploadBytes(fileRef,file)
        const photoUrl=await getDownloadURL(fileRef)
        return photoUrl
    }catch(err){
        console.log('Hiba a fájlfeltöltés során:',err);
        throw err
    }

}

export const getAvatar = async (userId, setAvatar)=>{
    const storageRefPng=ref(storage, `avatars/${userId}.png`)
    const storageRefJpg=ref(storage, `avatars/${userId}.jpg`)
    try {
        let downloadUrl
        try {
            downloadUrl=await getDownloadURL(storageRefPng)
        } catch (pngMsg) {
            console.log('Nincs png', pngMsg);
            downloadUrl=await getDownloadURL(storageRefJpg)
        }
    setAvatar(downloadUrl)
    }catch(msg){
        console.log('Nincs avatar',msg);
    }
}

export const deleteAvatar = async (userId) =>{
    let downloadUrl
    let pngFound=false
    try {
        const storageRefPng=ref(storage, `avatars/${userId}.png`)
        downloadUrl=  getDownloadURL(storageRefPng)
        if (downloadUrl) {
            await deleteObject(storageRefPng)
            pngFound=true
        }

    } catch (msg) {
        console.log('Png törlése nem sikerült', msg);
    }
    if(!pngFound){
    try {
        const storageRefJpg=ref(storage, `avatars/${userId}.jpg`)
        downloadUrl= await getDownloadURL(storageRefJpg)
        if(downloadUrl)
            await deleteObject(storageRefJpg)
    } catch (msg) {
        console.log('Jpg törlése nem sikerült', msg);
    }}
}