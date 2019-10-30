const assert = require('assert');
const is = require('is-type-of');
const debug = require('debug')('akos:server:extension:handleCustomCode');
const createEnum = require('./lib/enum.js').createEnum

module.exports = function (app, option) {
    assert.ok(app);
    const key = '_code';
    const  ResponseCode = createEnum(option. ResponseCode)|| require('./lib/enum.js').ResponseCode;
    let requestId = '';
    app.use(async function (ctx, next) {
        try {
            requestId = ctx.reqId;
            await next();
        } catch (error) {
            debug('To receive a new error messages error: %j', error);

            if (error._inner) {
                // Returns the custom error code
                debug(' include “inner”，status set 200.');
                this.status = 200;
            } else {
                debug('exclude “inner”，throw error');
                throw error;
            }
        }
    });

    app.context.throwCodeError = throwCodeError;
    app.context.setCodeError = setCodeError;
    app.context.setBodyResult = setBodyResult;
    app.context.setBodyContent = setBodyContent;

    /**
     * Set the code/msg/ to this.body，and interrupt program is running。
     * The error will only in log records and will not sell them
     * @param {number} code - The default is ResponseCode.Invalid
     * @param {string} msg
     * @param {*} error
     */
    function throwCodeError(code = ResponseCode.Invalid, msg) {
        debug('throwCodeError the parameters of the receiving code: %j,msg: %j', code, msg);
        if (typeof code === 'string') {
            code = ResponseCode[code] || ResponseCode.Invalid;
        }
        // Normal set up information
        this.body = {
            code,
            msg,
        };
        // Interrupt the process immediately
        const obj = { _inner: true };
        throw obj;
    }

    /**
     * set code/msg/to this.body，and interrupt program is running。
     * @param {number} code - The default is ResponseCode.Invalid
     * @param {string} msg
     */
    function setCodeError(code = ResponseCode.Invalid, msg) {
        debug('setCodeError code: %j,msg: %j', code, msg);
        // 正常设置信息
        this.body = {
            code,
            msg,
        };
    }

    /**
     * let this.body code set ResponseCode.Success,(this.xxx)，result set this.body.result
     * @param {*} result
     */
    function setBodyResult(result) {
        this.body = {
            code: ResponseCode.Success,
            result,
        };
    }

    /**
   * let this.body code set ResponseCode.Success,(this.xxx)，result set this.body.result
   * @param {*} result
     */
    function setBodyContent(repCode, content, extend) {
        let code = 200;
        if (repCode && is.number(repCode))
            code = repCode;
        if (repCode && is.string(repCode))
            code = ResponseCode[repCode];

        if (code >= 200 && code < 300)
            this.body = {
                code,
                result: content,
            };
        else if (code === 406 || code === 401) {
            this.status = code;
            this.body = {
                code,
                msg: content,
            };
        } else if (code >= 500) {
            this.status = code;
            if (is.object(content))
                content = content.message || 'system internal error';
            this.body = {
                code,
                msg: content,
            };
        } else
            this.body = {
                code,
                msg: content,
            };
        if (is.object(extend)) {
            this.body = Object.assign(this.body, extend);
        }
        if (option && option.requestId === true)
            this.body.requestId = requestId;
    }
};
