import { Document, Schema, model } from 'mongoose';

export interface IFeedback extends Document {
  user_code_id: Schema.Types.ObjectId,
  feedback: string,
  readed: boolean
}

// Event Schema
const feedbackSchema = new Schema<IFeedback>(
    {
      user_code_id: {
        type: Schema.Types.ObjectId,
        required: true
      },
      feedback: {
        type: String,
        maxlength: 10000
      },
      readed: {
        type: Boolean,
        default: false
      }
    },
    {
      timestamps: false
    }
  );

  feedbackSchema.post("save", (error:any, doc:any, next:any) => {
    switch(error.code){
        case 11000:
            next({error: "This feedback is already exist, if you want to update the base informations please go to update", code: 11000});
            break;
        case 121:
            console.log(error)
            next({error: "Invalid Code datas", code: error.code});
            break;
        default:
            next({error: `Error while registering the code. CODE: ${error.code} ${error.topic}` , code: 0});
            break;
    }
  })

export default model<IFeedback>('feedback', feedbackSchema);

// Error while registering the event. CODE: undefined {"errors":{"topic":{"name":"ValidatorError","message":"Path `topic` is required.","properties":{"message":"Path `topic` is required.","type":"required","path":"topic"},"kind":"required","path":"topic","originalLine":1,"originalColumn":28}},"_message":"event validation failed","originalLine":1,"originalColumn":28,"name":"ValidationError","message":"event validation failed: topic: Path `topic` is required."}