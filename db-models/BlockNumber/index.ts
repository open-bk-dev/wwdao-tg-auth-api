import { Document, Schema, model } from 'mongoose';

export interface IBlockNumber extends Document {
    blockNumber: Number
}

// Event Schema
const blockNumberSchema = new Schema<IBlockNumber>(
    {
      blockNumber: {
        type: Number,
        required: true
      }
    },
    {
      timestamps: false
    }
);

blockNumberSchema.post("save", (error:any, doc:any, next:any) => {
    switch(error.code){
        case 11000:
            next({error: "This Base is already exist, if you want to update the base informations please go to update", code: 11000});
            break;
        case 121:
            next({error: "Invalid Base datas", code: error.code});
            break;
        default:
            next({error: `Error while registering the event. CODE: ${error.code} ${error.topic}` , code: 0});
            break;
    }
})

export default model<IBlockNumber>('blockNumber', blockNumberSchema);

// Error while registering the event. CODE: undefined {"errors":{"topic":{"name":"ValidatorError","message":"Path `topic` is required.","properties":{"message":"Path `topic` is required.","type":"required","path":"topic"},"kind":"required","path":"topic","originalLine":1,"originalColumn":28}},"_message":"event validation failed","originalLine":1,"originalColumn":28,"name":"ValidationError","message":"event validation failed: topic: Path `topic` is required."}