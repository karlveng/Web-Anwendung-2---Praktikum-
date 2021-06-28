const num= require("../helper.js")
const wert= "5"
const result=true

test("Test Numeric", ()=>{
    expect(num.isNumeric(wert)).toEqual(result)
})

