const num= require("../helper.js")
const array= []
const result=true

test("Test isArrayEmpty", ()=>{
    expect(num.isArrayEmpty(array)).toEqual(result)
})