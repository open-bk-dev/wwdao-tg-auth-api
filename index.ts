import { ethers } from "ethers";

import { dbConnected } from "./db-connect/dbConnect";

import User from "./db-models/User";
import SecuredLinks from "./db-models/SecuredLinks";
import { SendMessage } from "./SendMessage/SendMessage";

export async function RunTgAuthAPI(bot:any){

    Bun.serve({
        port: Bun.env.PORT || 8003,
        async fetch(req) {
            const url = new URL(req.url);
            if (url.pathname === "/" && req.method == "GET"){
                let res = new Response(JSON.stringify({ code: 200, message: "API IS UP V2!" }));
                
                res.headers.set("Content-Type", "application/json");
                res.headers.set("Access-Control-Allow-Origin", "*");
                return(res);
            }
            if (url.pathname === "/register" && req.method == "POST"){
                if(dbConnected){
                    let authenticated = false;

                    let address = url.searchParams.get("address");
                    let signature = url.searchParams.get("signature");
                    let message = url.searchParams.get("message");
                    let securedLink = url.searchParams.get("secured_link");

                    const CheckLink = await SecuredLinks.findOne({ link: securedLink || "", deleted: false });

                    if( CheckLink == null ){
                        console.log("Invalid Link.");
                        return false;
                    }

                    let expired = parseInt(CheckLink?.expiry) <= Date.now();
                    
                    if(expired){

                        let res = new Response(JSON.stringify({ code: 403, message: "Link is expired!" }));
                        res.headers.set("Content-Type", "application/json");
                        res.headers.set("Access-Control-Allow-Origin", "*");

                        return res

                    }

                    if( address != null && message != null && signature != null){
                        
                        const decodedAddress = ethers.verifyMessage(message, signature != null ? signature : "");

                        if(address.toLowerCase() === decodedAddress.toLowerCase()) authenticated = true

                        const UserExist = await User.findOne({
                            account: decodedAddress.toLowerCase()
                        })
                        
                        if( UserExist == null ){
                            let res;
                            res = new Response(JSON.stringify({ code: 404, message: "No WorldWarDAO account found for this address" }));
                            res.headers.set("Content-Type", "application/json");
                            res.headers.set("Access-Control-Allow-Origin", "*");
                            return res;
                        }

                        if(authenticated){
                            let userAndUpdate = await User.findOneAndUpdate({ account: (decodedAddress).toLowerCase() }, { tg: CheckLink.tgId }).exec();

                            CheckLink.deleted = true;
                            
                            await CheckLink.save();

                            let isUpdated = (userAndUpdate == null ? false : true);
                            
                            let res;

                            if(isUpdated && userAndUpdate != null){
                                SendMessage(userAndUpdate.tg, "Notifications has been activated!");
                                res = new Response(JSON.stringify({ code: 200, message: "Wallet authenticated!" })); 
                                res.headers.set("Content-Type", "application/json");
                                res.headers.set("Access-Control-Allow-Origin", "*");
                                return res;
                            }else{
                                res = new Response(JSON.stringify({ code: 500, message: "Error while updating your wallet!" }));
                                res.headers.set("Content-Type", "application/json");
                                res.headers.set("Access-Control-Allow-Origin", "*");
                                return res;
                            }
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
                }else{
                    let res = new Response(JSON.stringify({ code: 503, message: "Service unavailable" }));
                    res.headers.set("Content-Type", "application/json");
                    res.headers.set("Access-Control-Allow-Origin", "*");

                    return (res);
                }
            }

            if (url.pathname === "/verify" && req.method == "GET"){
                const url = new URL(req.url);
            
                let securedLink = url.searchParams.get("secured_link");

                const CheckLink = await SecuredLinks.findOne({
                    link: securedLink,
                    deleted: false
                })

                if(CheckLink == null){
                    let res = new Response(JSON.stringify({ code: 403, message: "Invalid Link" }));
                    res.headers.set("Content-Type", "application/json");
                    res.headers.set("Access-Control-Allow-Origin", "*");

                    return (res);
                }else{

                    let expired = parseInt(CheckLink?.expiry) <= Date.now();
                    
                    if(expired){
                        let res = new Response(JSON.stringify({ code: 403, message: "Invalid link" }));
                        res.headers.set("Content-Type", "application/json");
                        res.headers.set("Access-Control-Allow-Origin", "*");

                        return (res);
                    }

                    let res = new Response(JSON.stringify({ code: 200, message: "Valid link" }));
                    res.headers.set("Content-Type", "application/json");
                    res.headers.set("Access-Control-Allow-Origin", "*");

                    return (res);
                }
            }
            
            return new Response("404!");
        }
    });

    console.log(`API is running on port ${Bun.env.PORT || 8080}`)
}

await RunTgAuthAPI("");