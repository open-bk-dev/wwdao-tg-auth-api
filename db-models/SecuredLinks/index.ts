import { Document, Schema, model } from 'mongoose';

export interface ISecuredLink extends Document {
  link: string,
  tgId: string,
  expiry: string
  deleted: Boolean
}

// Event Schema
const securedLinkSchema = new Schema<ISecuredLink>(
    {
      link: {
        type: String,
        required: false
      },
      tgId: {
        type: String,
        required: true,
        default: null
      },
      expiry: {
        type: String,
        required: false,
        default: null
      },
      deleted: {
        type: Boolean,
        required: false,
        default: false
      }
    },
    {
      timestamps: false
    }
  );

  securedLinkSchema.post("save", (error:any, doc:any, next:any) => {
    switch(error.code){
        case 11000:
            next({error: "This link is already exist, if you want to update the base informations please go to update", code: 11000});
            break;
        case 121:
            console.log(error)
            next({error: "Invalid Link datas", code: error.code});
            break;
        default:
            next({error: `Error while registering the code. CODE: ${error.code} ${error.topic}` , code: 0});
            break;
    }
  })

export default model<ISecuredLink>('securedlink', securedLinkSchema);

// Error while registering the event. CODE: undefined {"errors":{"topic":{"name":"ValidatorError","message":"Path `topic` is required.","properties":{"message":"Path `topic` is required.","type":"required","path":"topic"},"kind":"required","path":"topic","originalLine":1,"originalColumn":28}},"_message":"event validation failed","originalLine":1,"originalColumn":28,"name":"ValidationError","message":"event validation failed: topic: Path `topic` is required."}