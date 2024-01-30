const SendMessage = async(chatId:any=null, message:any=null) => {
    let body:any = {};

    if(chatId)
        body.chatId = chatId
    
    if(message)
        body.message = message

    fetch(`${Bun.env.TG_API_URL}/sendMessage`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${Bun.env.TG_API_AUTH_TOKEN}`,
            'Content-Type': 'text/plain'
        },
        body: JSON.stringify(body)
    })
}

const SendMonitoringMessage = async( message:any=null ) => {
    let body:any = {};

    if(message)
        body.message = message

    fetch(`${Bun.env.TG_API_URL}/monitoring/sendMessage`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${Bun.env.TG_API_AUTH_TOKEN}`,
            'Content-Type': 'text/plain'
        },
        body: JSON.stringify(body)
    })
}

const SendRawMessage = async(chatId:any=null, topicId:any=null, message:any=null) => {
    try{
        let _body:any = {};

        if(chatId){
            _body.chatId = chatId
        }

        if(topicId){
            _body.topicId = topicId
        }
        
        if(message){
            _body.message = message
        }

        await fetch(`${Bun.env.TG_API_URL}/sendRawMessage`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${Bun.env.TG_API_AUTH_TOKEN}`,
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify(_body)
        })
        
    }catch(err){
        console.log(err)
    }
    
}

const SendMessageWithPicture = async(chatId:any=null, pictureLink:any=null, topicId:any=null, message:any=null) => {
    try{
        let _body:any = {};

        if(chatId){
            _body.chatId = chatId
        }

        if(pictureLink){
            _body.pictureLink = pictureLink
        }

        if(topicId){
            _body.topicId = topicId
        }
        
        if(message){
            _body.message = message
        }

        await fetch(`${Bun.env.TG_API_URL}/sendMessageWithPicture`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${Bun.env.TG_API_AUTH_TOKEN}`,
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify(_body)
        })
        
    }catch(err){
        console.log(err)
    }
}

export { SendMessage, SendRawMessage, SendMessageWithPicture, SendMonitoringMessage }