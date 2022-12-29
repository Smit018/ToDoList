const express=require('express');
const bodyparser=require('body-parser')
const mongoose=require('mongoose');
const _ =require('lodash');


const app=express();
app.use(express.static("public"))
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended:true}))


mongoose.connect("mongodb+srv://admin-smit:Smit%40agrawal2@cluster0.06fjegz.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology:true
}, (err)=>{

if(err)

{
console.log(err)

}else{

console.log("successfully connected")

}
});
// const mongoDB="mongodb://127.0.0.1/todolistDB";

// mongoose.connect(mongoDB,(err)=>{
//     if(err) console.log('Unable to connect to the server: ${err}');
//     else
//     console.log("MongoDB is connected");
// })

const itemsSchema={
    name:String
};

const Item=mongoose.model("Item",itemsSchema)

const item1=new Item({
    name:"Welcome to your to-do-list!"
});
const item2=new Item({
    name:"click + to create new item"
});
const item3=new Item({
    name:"<-- hit this to delete an item>"
});

const defaultItems=[item1,item2,item3];

const listsSchema={
    name:String,
    items:[itemsSchema]
};
const List=mongoose.model("List",listsSchema)




app.get("/",function(req,res){
    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err) console.log(err);
                else console.log("successfuly saved all the items to database!")
            });
            res.redirect("/");
        }else{
            res.render("lists",{listTitle:"Today",newlistitems:foundItems});
        }
        
    })
     
})

app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                // create a new list
                const list=new List({
                    name:customListName,
                    items:defaultItems
                 });
                 list.save();
                 res.redirect("/"+customListName)
            }else{
                res.render("lists",{listTitle:foundList.name,newlistitems:foundList.items})
            }
        }
    });
});
     
app.post("/",function(req,res){
    
    let itemName=req.body.newitem;
    const listName=req.body.list;

    const item=new Item({
        name:itemName
    })
    if(listName==="Today"){
        item.save()
    res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,foundList){
             foundList.items.push(item);
             foundList.save();
             res.redirect("/"+listName);
        })
    }
})



app.post("/delete",function(req,res){
      const checkedItemId=(req.body.checkbox)
      const listName=req.body.listName;
      if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("Succesfully deleted")
                res.redirect("/");
            }
          });
      }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
      }
      
    
});











app.listen("3000",function(){
      console.log("Server is running on port 3000")
})