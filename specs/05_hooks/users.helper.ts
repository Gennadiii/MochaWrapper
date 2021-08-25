import {userInterface} from "./suite.helper";


export const usersHelper = {
  all: {1: {name: 'Vasyl'}, 2: {name: `Mar'iana`}},
  allocatedUsers: {},
  allocate(): userInterface {
    const [id, user] = Object.entries(this.all)[0];
    console.info(`Allocating user by name: ${user.name}`);
    delete this.all[id];
    this.allocatedUsers[id] = user;
    return {
      id,
      ...user,
      free: () => {
        console.info(`Freeing user by name: ${user.name}`);
        this.all[id] = user;
        delete this.allocatedUsers[id];
      },
    };
  },
};
