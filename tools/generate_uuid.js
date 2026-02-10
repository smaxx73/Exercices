function genererChaineAleatoire() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let resultat = '';
  for (let i = 0; i < 4; i++) {
    resultat += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return resultat;
}

console.log(genererChaineAleatoire());
