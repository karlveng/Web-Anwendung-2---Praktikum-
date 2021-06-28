const num= require("../helper.js")
const val= undefined
const result=true

test("Test isUndefined", ()=>{
    expect(num.isUndefined(val)).toEqual(result)
})