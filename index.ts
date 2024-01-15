import { ethers } from "ethers";

import { dbConnected } from "./db-connect/dbConnect";

import User from "../db-models/User";
import SecuredLinks from "../db-models/SecuredLinks";

export async function RunTgAuthAPI(bot:any){

    const GetUserAuthenticate = async(secured_link:string | null) => {
        let securedLink = await SecuredLinks.findOne({ link: secured_link });

        if( securedLink == null ){
            console.log("Invalid Link.");
            return false;
        }
        
        let expired = parseInt(securedLink?.expiry) <= Date.now();
        
        if(expired){
            console.log("Link expired");
            return false;
        }

        let userFind = await User.findOne({ tg: securedLink?.tgId }).exec();
        let isUser = userFind == null ? false : true;
        
        if(isUser){
            let user = await User.findOne({ tg: securedLink?.tgId, isAuthenticate: false }).exec();
            let userAuth = user == null ? false : true;
            
            if(userAuth){
                return { authNonce: user?.authNonce, tgId: securedLink?.tgId };
            }else{
                console.log("User already authenticate");
                return false;
            }
        }else{
            console.log("User not found");
            return false;
        }
    }

    const GetUserAuthenticateUpdate = async(secured_link:string | null) => {
        console.log("link", secured_link)
        let securedLink = await SecuredLinks.findOne({ link: secured_link, deleted: false });

        if( securedLink == null ){
            console.log("Invalid Link.");
            return false;
        }

        let expired = parseInt(securedLink?.expiry) <= Date.now();
        
        if(expired){
            console.log("Link expired");
            return false;
        }

        let userFind = await User.findOne({ tg: securedLink?.tgId, isAuthenticate: true }).exec();
        let isUser = userFind == null ? false : true;
        
        if(isUser){
            if(userFind != null){
                return { authNonce: userFind?.authNonce, tgId: securedLink?.tgId };
            }else{
                console.log("User already authenticate");
                return false;
            }
        }else{
            console.log("User not found");
            return false;
        }
    }

    const ValidateAuth = async( tgId: string | null ) => {
        
        let userFind = await User.findOne({ tg: tgId }).exec();
        let isUser = userFind == null ? false : true;
        
        if(isUser){
            let user = await User.findOne({ tg: tgId, isAuthenticate: false }).exec();
            
            if(user){
                return true;
            }else{
                return false;
            }
        }else{
            console.log("User not found");
            return false;
        }

    }

    const ValidateAuthUpdate = async( tgId: string | null ) => {
        
        let userFind = await User.findOne({ tg: tgId }).exec();
        let isUser = userFind == null ? false : true;
        
        if(isUser){
            let user = await User.findOne({ tg: tgId, isAuthenticate: true }).exec();
            
            if(user){
                return true;
            }else{
                return false;
            }
        }else{
            console.log("User not found");
            return false;
        }

    }

    Bun.serve({
        port: 8080,
        async fetch(req) {
            const url = new URL(req.url);
            if (url.pathname === "/" && req.method == "GET"){
                let res = new Response(JSON.stringify({ code: 200, message: "API IS UP V2!" }));
                
                res.headers.set("Content-Type", "application/json");
                res.headers.set("Access-Control-Allow-Origin", "*");
                return(res);
            }
            if (url.pathname === "/register" && req.method == "GET"){
                if(dbConnected){
                    let secured_link = url.searchParams.get("secured_link");
                    
                    let authNonce = (await GetUserAuthenticate(secured_link));

                    if( authNonce != false ){
                        let isAuth = await ValidateAuth(authNonce?.tgId);
                        let res;

                        if(isAuth){
                            res = new Response(JSON.stringify({ code: 200, message: {authNonce: authNonce?.authNonce} }));
                            res.headers.set("Content-Type", "application/json");
                            res.headers.set("Access-Control-Allow-Origin", "*");
                        }else{
                            res = new Response(JSON.stringify({ code: 500, message: "Error while identifing your wallet!" }));
                            res.headers.set("Content-Type", "application/json");
                            res.headers.set("Access-Control-Allow-Origin", "*");
                        }
    
                        return (res);
                    }else{
                        let res = new Response(JSON.stringify({ code: 400, message: "Bad request" }));
                        res.headers.set("Content-Type", "application/json");
                        res.headers.set("Access-Control-Allow-Origin", "*");
    
                        return (res);
                    }
                }else{
                    let res = new Response(JSON.stringify({ code: 503, message: "Service unavailable" }));
                    res.headers.set("Content-Type", "application/json");
                    res.headers.set("Access-Control-Allow-Origin", "*");

                    return (res);
                }
            }
            if (url.pathname === "/update" && req.method == "GET"){
                if(dbConnected){
                    let secured_link = url.searchParams.get("secured_link");
                    
                    let authNonce = (await GetUserAuthenticateUpdate(secured_link));

                    if( authNonce != false ){
                        let isAuth = await ValidateAuthUpdate(authNonce?.tgId);
                        let res;

                        if(isAuth){
                            res = new Response(JSON.stringify({ code: 200, message: {authNonce: authNonce?.authNonce} }));
                            res.headers.set("Content-Type", "application/json");
                            res.headers.set("Access-Control-Allow-Origin", "*");
                        }else{
                            res = new Response(JSON.stringify({ code: 500, message: "Error while identifing your wallet!" }));
                            res.headers.set("Content-Type", "application/json");
                            res.headers.set("Access-Control-Allow-Origin", "*");
                        }
    
                        return (res);
                    }else{
                        let res = new Response(JSON.stringify({ code: 400, message: "Bad request" }));
                        res.headers.set("Content-Type", "application/json");
                        res.headers.set("Access-Control-Allow-Origin", "*");
    
                        return (res);
                    }
                    
                }else{
                    let res = new Response(JSON.stringify({ code: 503, message: "Service unavailable" }));
                    res.headers.set("Content-Type", "application/json");
                    res.headers.set("Access-Control-Allow-Origin", "*");

                    return (res);
                }
            }
            if (url.pathname === "/verify" && req.method == "POST"){
                const url = new URL(req.url);
                
                let authenticated = false;

                let address = url.searchParams.get("address");
                let signature = url.searchParams.get("signature");
                let securedLink = url.searchParams.get("secured_link");

                let authNonce = await GetUserAuthenticate(securedLink) || false;

                if( authNonce != false && address != null ){
                    
                    const decodedAddress = ethers.verifyMessage(authNonce?.authNonce.toString(), signature != null ? signature : "");

                    if(address.toLowerCase() === decodedAddress.toLowerCase()) authenticated = true
                  
                    if(authenticated){
                        let userAndUpdate = await User.findOneAndUpdate({ tg: authNonce?.tgId, isAuthenticate: false }, { account: (decodedAddress).toLowerCase(), isAuthenticate: true });

                        await SecuredLinks.findOneAndUpdate({ link: securedLink }, { deleted: true });

                        let isUpdated = (userAndUpdate == null ? false : true);
                        let res;

                        if(isUpdated && userAndUpdate != null){
                            bot && bot.api.sendMessage(userAndUpdate.tg, "Your wallet address has been verified!");
                            res = new Response(JSON.stringify({ code: 200, message: "Wallet authenticated!" })); 
                            res.headers.set("Content-Type", "application/json");
                            res.headers.set("Access-Control-Allow-Origin", "*");
                        }else{
                            res = new Response(JSON.stringify({ code: 500, message: "Error while updating your wallet!" }));
                            res.headers.set("Content-Type", "application/json");
                            res.headers.set("Access-Control-Allow-Origin", "*");
                        }

                        return (res);
                    }else{
                        let res = new Response(JSON.stringify({ code: 400, message: "Error while authenticating your wallet" }));
                        res.headers.set("Content-Type", "application/json");
                        res.headers.set("Access-Control-Allow-Origin", "*");

                        return (res);
                    }
                    
                }else{
                    let res = new Response(JSON.stringify({ code: 400, message: "Bad request" }));
                    res.headers.set("Content-Type", "application/json");
                    res.headers.set("Access-Control-Allow-Origin", "*");

                    return (res);
                }
            }
            if (url.pathname === "/update_wallet" && req.method == "POST"){
                const url = new URL(req.url);
                
                let authenticated = false;

                let address = url.searchParams.get("address");
                let signature = url.searchParams.get("signature");
                let securedLink = url.searchParams.get("secured_link");

                let authNonce = await GetUserAuthenticateUpdate(securedLink) || false;

                if( authNonce != false && address != null ){
                    
                    const decodedAddress = ethers.verifyMessage(authNonce?.authNonce.toString(), signature != null ? signature : "");

                    if(address.toLowerCase() === decodedAddress.toLowerCase()) authenticated = true
                  
                    if(authenticated){
                        let userAndUpdate = await User.findOneAndUpdate({ tg: authNonce?.tgId, isAuthenticate: true }, { account: (decodedAddress).toLowerCase(), isAuthenticate: true });

                        await SecuredLinks.findOneAndUpdate({ link: securedLink }, { deleted: true });

                        let isUpdated = (userAndUpdate == null ? false : true);
                        let res;

                        if(isUpdated && userAndUpdate != null){
                            bot && bot.api.sendMessage(userAndUpdate.tg, "Your wallet address has been verified!");
                            res = new Response(JSON.stringify({ code: 200, message: "Wallet authenticated!" })); 
                            res.headers.set("Content-Type", "application/json");
                            res.headers.set("Access-Control-Allow-Origin", "*");
                        }else{
                            res = new Response(JSON.stringify({ code: 500, message: "Error while updating your wallet!" }));
                            res.headers.set("Content-Type", "application/json");
                            res.headers.set("Access-Control-Allow-Origin", "*");
                        }

                        return (res);
                    }else{
                        let res = new Response(JSON.stringify({ code: 400, message: "Error while authenticating your wallet" }));
                        res.headers.set("Content-Type", "application/json");
                        res.headers.set("Access-Control-Allow-Origin", "*");

                        return (res);
                    }
                    
                }else{
                    let res = new Response(JSON.stringify({ code: 400, message: "Bad request" }));
                    res.headers.set("Content-Type", "application/json");
                    res.headers.set("Access-Control-Allow-Origin", "*");

                    return (res);
                }
            }
            return new Response("404!");
        }
    });
}

await RunTgAuthAPI("");