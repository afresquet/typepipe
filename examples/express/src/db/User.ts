export interface User {
	id: number;
	name: string;
	email: string;
}

const users: User[] = [];
let id = 0;

export const UserModel = {
	async create(user: Pick<User, "name" | "email">): Promise<User> {
		const length = users.push({
			...user,
			id: ++id,
		});

		return users[length - 1];
	},
	async read(id: number) {
		return users.find(user => user.id === id);
	},
	async update(id: number, user: Partial<User>) {
		const index = users.findIndex(user => user.id === id);

		if (index === -1) {
			return null;
		}

		users[index] = {
			...users[index],
			...user,
		};

		return users[index];
	},
	async delete(id: number) {
		const index = users.findIndex(user => user.id === id);

		if (index === -1) {
			return null;
		}

		return users.splice(index, 1)[0];
	},
};
