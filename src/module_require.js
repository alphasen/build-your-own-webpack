let id=1

module.exports={
    name:'lilei',
    age:33,
    eat(food){
        console.log(food);
    },
    sayId(){
        console.log(id);
    },
    incId(){
        id++
    }
}
