const User = require('../../models/user.js');
const Todo = require('../../models/todoList.js');
const helper = require('./../../helpers/notification');

const { dateToString } = require('../../helpers/date');
const addMinutes = require('../../helpers/addMinutes');
const user = (userId) => {
	return User.findById(userId)
		.then((user) => {
			return { ...user._doc, _id: user._id };
		})
		.catch((err) => {
			throw err;
		});
};

const todoListsfromObject = async (todoIds) => {
	const sharedTodos = await Todo.find({ _id: { $in: todoIds } });
	return sharedTodos.map((todo) => {
		return {
			...todo._doc,
			deadline: dateToString(todo._doc.deadline),
			createdOn: dateToString(todo._doc.createdOn),
		};
	});
};

const owner = async (userId) => {
	const user = await User.findById(userId);
	const ownerData = { _id: user._id, email: user.email, name: user.name };
	return ownerData;
};

const todos = async (todoIds) => {
	const todos = await Todo.find({ _id: { $in: todoIds } });
	return todos.map((todo) => {
		return {
			...todo._doc,
			_id: todo._id,
			owner: user.bind(this, todo.owner),
			deadline: dateToString(todo._doc.deadline),
			createdOn: dateToString(todo._doc.createdOn),
		};
	});
};

module.exports = {
	getUserById: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('Unauthenticated!');
		}

		const curr = await User.findOne({ _id: args.userInput._id });
		let createdUser;

		createdUser = {
			...curr._doc,
			_id: curr._id,
			todo: todos.bind(this, curr.todoList),
			sharedTodoLists: todoListsfromObject.bind(this, curr.sharedTodoLists),
			archiveTodo: todoListsfromObject.bind(this, curr.archiveTodo),
		};
		return createdUser;
	},

	CreateTodo: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('Unauthenticated!');
		}
		const { userId: owner, description, label, status, priority, createdOn, deadline } = args.todoInput;
		const todo = new Todo({
			owner,
			description,
			label,
			status,
			priority,
			createdOn: new Date(createdOn),
			deadline: new Date(deadline),
		});
		let createdTodo;
		const results = await todo.save();
		createdTodo = {
			...results._doc,
			_id: results._id,
			owner: user.bind(this, results._doc.owner),
		};
		const creator = await User.findById(owner);
		creator.todoList.push(todo);
		await creator.save();

		await helper.startMonitoring(results._id, creator.email, addMinutes(new Date(deadline, 60)), description);
		return createdTodo;
	},

	getTodoById: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('Unauthenticated!');
		}
		const curr = await Todo.findById(args.todoInput._id);
		let createdTodo;
		createdTodo = {
			...curr._doc,
			_id: curr._id,
			deadline: dateToString(curr._doc.deadline),
			createdOn: dateToString(curr._doc.createdOn),
			owner: user.bind(this, curr.owner),
		};
		return createdTodo;
	},

	addSubTask: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('Unauthenticated!');
		}
		const curr = await Todo.findById(args.todoInput.todoId);
		curr.subTasks.push({
			description: args.todoInput.description,
			assignedTo: args.todoInput.assignedTo,
			status: args.todoInput.status,
			priority: args.todoInput.priority,
		});

		const result = await curr.save();

		return result.subTasks[result.subTasks.length - 1]._doc;
	},

	addSharedUser: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('Unauthenticated!');
		}

		const user = await User.findOne({ email: args.userInput.email });
		if (user) {
			const todoListtobeShared = await Todo.findById(args.userInput.todoListId);
			user.todoList.push(todoListtobeShared._id);
			await user.save();
			todoListtobeShared.sharedWith.push({
				userId: user._id,
				userEmail: user.email,
			});
			await todoListtobeShared.save();
			const sharedTodo = {
				...todoListtobeShared._doc,
				owner: owner.bind(this, todoListtobeShared.owner),
			};
			return sharedTodo;
		} else {
			throw new Error("User doesn't exisit");
		}
	},

	archiveTodo: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('Unauthenticated!');
		}
		const todoTobeArchived = await Todo.findById(args.todoInput.todoId);
		todoTobeArchived.category = 'Archive';
		todoTobeArchived.status = args.todoInput.status;
		await helper.cancelJob(args.todoInput.todoId);
		await todoTobeArchived.save();

		return todoTobeArchived;
	},

	unarchiveTodo: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('Unauthenticated!');
		}
		const todoTobeArchived = await Todo.findById(args.todoInput.todoId);
		todoTobeArchived.category = 'Interface';
		todoTobeArchived.status = args.todoInput.status;
		await todoTobeArchived.save();
		return todoTobeArchived;
	},

	updateTodo: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('Unauthenticated!');
		}

		const todoToUpdate = await Todo.findById(args.todoInput._id);
		const owner = await User.findById(todoToUpdate.owner._id);
		for (key in args.todoInput) {
			if (key !== null && key !== 'subTasks') {
				const value = args.todoInput[key];
				todoToUpdate[key] = value;
				if (key === 'deadline') {
					await helper.changeTodoDeadline(
						args.todoInput._id,
						owner.email,
						addMinutes(todoToUpdate.deadline, 60),
						todoToUpdate.description,
					);
				}
			} else if (key !== null && key === 'subTasks') {
				const value = args.todoInput[key];

				for (i in todoToUpdate[key]) {
					if (todoToUpdate[key][i]._id == value._id) {
						for (subkey in value) {
							if (value[subkey]) {
								todoToUpdate[key][i][subkey] = value[subkey];
							}
						}
						break;
					}
				}
			} else {
				continue;
			}
		}
		await todoToUpdate.save();
		return todoToUpdate;
	},

	removeTodo: async (args, req) => {
		if (!req.isAuth) {
			throw new Error('Unauthenticated!');
		}
		try {
			const todo = await Todo.findById(args.todoInput.todoId);
			todo.remove();
			return { result: true };
		} catch (error) {
			return { result: false };
		}
	},
};
