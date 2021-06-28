const num= require("../helper.js")
const val= null
const result=true

test("Test isNull", ()=>{
    expect(num.isNull(val)).toEqual(result)
})