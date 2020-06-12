const { buildSchema } = require('graphql');
//structure of schemas will be input, follwed by type.
//RootQuery and RootMutation should always be in end. Edit this comment in case of any addition/substraction
module.exports = buildSchema(`
    
    input SignupUserInput
    {
        name: String
        email: String
        password: String
    }
    input LoginUserInput
    {
        email: String
        password: String
    }
    
    input GetUserByIdInput
    {
        _id:ID
    }
    input sharingUserInput
    {
        email: String
        todoListId: ID
    }
    
    input CreateTodoInput
    {
        userId:ID
        description:String
        label:String
        status:String
        createdOn:String
        deadline:String
        priority: String
    }
    
    input subTasksUpdate
    {
        _id: ID
        description: String
        assignedTo: String
        status: String
        priority: Boolean
    }
    
    input updateTodoInput
    {
        _id: ID
        description:String
        label:String
        status:String
        deadline:String
        subTasks: subTasksUpdate
    }
    input GetTodoByIdInput
    {
        _id:ID
        token:String
    }
 
    input addSubTasksInput
    {
        todoId:ID,
        token:String,
        description:String,
        assignedTo: String,
        status: String,
        priority: Boolean
    }
    input archiveInput
    {
        todoId: ID,
        status: String,
    }
    input removeTodoInput
    {
        todoId: ID
    }
    type subTask
    {
        _id:ID
        description:String
        assignedTo:String
        priority: Boolean
        status: String
    }
    type sharedUserDetails
    {
        userId: String,
        userEmail: String
    }
    type Todo
    {
        _id:ID
        owner:User
        description:String
        status: String
        label:String
        subTasks:[subTask]
        createdOn:String
        deadline:String
        priority: String
        sharedWith: [sharedUserDetails]
        category: String
    }
    
    type User
    {
        _id: ID
        name: String
        email: String
        password: String
        todo:[Todo!]
        sharedTodoLists: [Todo]
        archivedTodo: [Todo]
    }
    type SigninToken
    {
        userEmail: String
        token:String
        userId: ID
    }
    
    type Result
    {
        result: Boolean
    }
    type RootQuery
    {
        users: [User]
        login(userInput: LoginUserInput): SigninToken
        getUserById(userInput: GetUserByIdInput): User
        getTodoById(todoInput: GetTodoByIdInput): Todo
    }
    type RootMutation
    {
        signup(userInput: SignupUserInput): User
        CreateTodo(todoInput: CreateTodoInput): Todo
        addSubTask(todoInput: addSubTasksInput): subTask
        addSharedUser(userInput: sharingUserInput): Todo
        archiveTodo(todoInput: archiveInput): Todo
        unarchiveTodo(todoInput: archiveInput): Todo
        removeTodo(todoInput: removeTodoInput): Result
        updateTodo(todoInput: updateTodoInput):Todo
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }`);
