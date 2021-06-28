const num= require("../helper.js")
const array= [1,2,3,4,5]
const result=true

test("Test isArray", ()=>{
    expect(num.isArray(array)).toEqual(result)
})