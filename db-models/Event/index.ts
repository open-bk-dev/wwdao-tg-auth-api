import { Document, Schema, model } from 'mongoose';

export interface IEvent extends Document {
    name: String,
    message: String,
    contractAddress: String,
    decodedTopic: String,
    encodedTopic: String,
    notifyType: Number,
    emitTo: Array<String>,
    subscribers: Schema.Types.ObjectId,
    deleted: Boolean
  }

// Event Schema
const eventSchema = new Schema<IEvent>(
    {
      name: {
        type: String,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      contractAddress: {
        type: String,
        maxlength: 42,
        minlength: 42,
        required: true
      },
      decodedTopic: {
        type: String,
        required: true
      },
      encodedTopic: {
        type: String,
        required: true
      },
      notifyType: {
        type: Number,
        required: true,
        enum: [0,1,2],
        default: 0
      },
      emitTo: [String],
      subscribers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }],
      deleted: {
        type: Boolean,
        default: false
      }
    },
    {
      timestamps: false
    }
  );

  eventSchema.post("save", (error:any, doc:any, next:any) => {
    switch(error.code){
        case 11000:
            next({error: "This event is already exist, if you want to update the event informations please go to update", code: 11000});
            break;
        case 121:
            next({error: "Invalid event datas", code: error.code});
            break;
        default:
            next({error: `Error while registering the event. CODE: ${error.code} ${error.topic}` , code: 0});
            break;
    }
  })

export default model<IEvent>('event', eventSchema);

// Error while registering the event. CODE: undefined {"errors":{"topic":{"name":"ValidatorError","message":"Path `topic` is required.","properties":{"message":"Path `topic` is required.","type":"required","path":"topic"},"kind":"required","path":"topic","originalLine":1,"originalColumn":28}},"_message":"event validation failed","originalLine":1,"originalColumn":28,"name":"ValidationError","message":"event validation failed: topic: Path `topic` is required."}