export function GenerateAuthCode(){
    let authCode = Array.from({length: 6}, () => Math.floor(Math.random() * 9) ).join("");
    return authCode
}