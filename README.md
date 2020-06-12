Please create a new branch before working

queries and mutations

mutation {
  CreateTodo(todoInput:{
    userId:"5ed28ceffe9ae42a9f5b12de",
    description:"First todo",
    label:"Personal",
    status:"Done",
    createdOn:"sdasda",
    deadline:"sdasda"
  }){
       
       owner{
        name
      },
       description
  }
}