import { Document, Schema, model } from 'mongoose';
import { AllRoles } from '../../config/AllRoles';


export interface IUser extends Document {
  tg: String
  account: String
  authNonce: String
  isAuthenticate: Boolean
  authenticationWebToken: String
  role: String
  subscribedEvents: Schema.Types.ObjectId
}

const userSchema = new Schema<IUser>(
  {
    tg: {
      type: String,
      required: true,
      unique: true,
    },
    account: {
      type: String,
      required: false,
      maxlength: 42,
      minlength: 42,
      default: null
    },
    authNonce: {
      type: String
    },
    isAuthenticate: {
      type: Boolean,
    },
    authenticationWebToken: {
      type: String,
    },
    role: {
      type: String,
      enum: AllRoles,
      default: AllRoles[0]
    },
    subscribedEvents: [{
      type: Schema.Types.ObjectId,
      ref: 'Event'
    }]
  },
  {
    timestamps: true,
  }
);

userSchema.post('save', function(error:any, doc:any, next:any) {
            
    switch(error.code){
        case 11000:
            next({error: "Your wallet is already registered, if you want to update your wallet informations please use\n\n/updatewallet", code: 11000});
            break;
        case 121:
            next({error: "Invalid address", code: error.code});
            break;
        default:
            next({error: `Error while registering your wallet. CODE: ${error.code}` , code: 0});
            break;
    }
});

userSchema.post('findOneAndUpdate', function(error:any, doc:any, next:any) {
    
    switch(error.code){
        case 11000:
            next({error: "Your wallet is already registered", code: 11000});
            break;
        case 121:
            next({error: "Invalid address", code: error.code});
            break;
        default:
            next({error: `Error while registering your wallet. CODE: ${error.code}` , code: 0});
            break;
    }
});

export default model<IUser>('user', userSchema);