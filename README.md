# akos-handCustomCode
hand custom formatting return

### introduce
1. option.ResponseCode 
   The custom code you want.
   ```
   // default
      {
        Success: 200,
        Unauthorized: 401,
        Invalid: 403,
        NotFound: 404,
        InternalError: 500,
    }
   ```
2. Provide  method；
- throwCodeError
- setCodeError
- setBodyResult
- setBodyContent
  
3. for example
   ```js
  async userInfo() {
        const ctx = this.ctx;
        //  a method to get user from mysql
        const user = await ctx.service.user.getInfo()
        ctx.setBodyContent(200, user)
    }
   ```
   - you will get the result
  ```js
  {
      code: 200,
      result: {
          //....userInfo....
      }
  }
  ```
