describe('My First Test', () => {
  it('clicks the link "type"', () => {
    cy.visit('http://localhost:5173/')

    cy.contains('Részletek').click()
    cy.get('.text-primary').click()
    cy.contains('Sign In').click()
    cy.get('#email').type('ninielnienor@gmail.com')
    cy.get('#password').type('123456')
    cy.get('.submit').click()

  })
})