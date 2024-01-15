class APIResponse{
    status: String;
    message: String;
    data: null | String | JSON | Object

    constructor(_status:String, _message:String, _data:null | String | JSON | Object) {
        this.status = _status;
        this.message = _message;
        this.data = _data;
      }
}

class MiddlewareResponse{
  status: Boolean;
  message: String;
  data: String | null | undefined;

  constructor( _status: Boolean, _message: String, _data?: String | null ) {
      this.status = _status;
      this.message = _message;
      this.data = _data;
    }
}

export { APIResponse, MiddlewareResponse }