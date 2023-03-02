
function countDec(x){
	return x.toString().includes(".") ? x.toString().split(".").pop().length : 0
}

module.exports={
	toInt(balance){
		if(/^-?[0-9]+(\.[0-9]*)?$/.test(balance)){
			balance=parseFloat(balance)
			if(countDec(balance)>2){
				return {"error":"Too much decimal precision, fractional copper pieces are not a thing."}
			}
			if(isNaN(balance)){
				return {"error":"Not a valid money format, check the `/help-format` command to see examples of valid formats."}
			}
			if(typeof(balance)=="number"){
				return {"value":balance*100}
			}
		}

		balance=balance.replaceAll(" ", "").replaceAll(",", "").replaceAll("cp", "c").replaceAll("gp", "g").replaceAll("sp", "s").replaceAll("pp", "p").replaceAll("p", "p ").replaceAll("g", "g ").replaceAll("s", "s ").replaceAll("c", "c ")
		balance=balance.split(" ")
		val=0
		types=["p","g","s","c"]
		for(let i=0;i<4;i++){
			bal=balance.filter(bal=> bal.endsWith(types[i]))
			for(bala of bal){
				bala=bala.replace(types[i], "")
				if(isNaN(bala)){
					return {"error":"Not a valid money format, check the `/help-format` command to see examples of valid formats."}
				}
				bala=parseFloat(bala)
				if (countDec(bala)>(3-i)){
					return {"error":"Too much decimal precision, fractional copper pieces are not a thing."}
				}
				
				val+=bala*(10**(3-i))
			}
		}
		if(isNaN(val)){
			return {"error":"Not a valid money format, check the `/help-format` command to see examples of valid formats."}
		}
		return {"value":val}
	},
	toGold(bal){
		let sig=Math.sign(bal)
		bal*=sig
		let res=(((bal%10)!=0) ? (" "+((sig==-1)? "-":"")+((bal%10).toString())+"cp") : "")
		bal=Math.floor(bal/10)
		res=((((bal%10)!=0) ? (" "+((sig==-1)? "-":"")+((bal%10).toString())+"sp") : "")+res)
		bal=Math.floor(bal/10)
		res=((sig==-1)? "-":"")+(((bal!=0) ? bal.toString()+"gp" : "")+res)
		if (res==""){
			res="0gp"
		}
		return res.trim()
		
	}
}