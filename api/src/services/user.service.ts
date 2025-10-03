import general from "../config/genDataSource";
import { User } from "../entity/general/user.entity";
import { v4 as uuidv4 } from "uuid";

export class UserService {
  static async validateUserData(data: Partial<User>) {
    if (!data.userbsid?.trim()) throw new Error("User BSID is required");
    if (!data.email?.trim()) throw new Error("Email is required");
  }

  static async createOrGet(userNetlink: string) {
    const userRepository = general.getRepository(User);

    // Check for existing user
    const existingUser = await userRepository.findOne({
      where: { userbsid: userNetlink },
    });
    if (existingUser) {
      const user = await userRepository.findOne({
        where: { userid: existingUser.userid }
      });
      return user;
    } else {
      // Create new user if not found
      const newUser = userRepository.create({
        userid: uuidv4(),
        userbsid: userNetlink,
        username: userNetlink,
        email: `${userNetlink}@uvic.ca`,
      });
      return await userRepository.save(newUser);
    }
  }

  static async createUser(data: Partial<User>) {
    await this.validateUserData(data);

    const userRepository = general.getRepository(User);

    // Check for existing user
    const existingUser = await userRepository.findOne({
      where: { userid: data.userid },
    });
    if (existingUser) throw new Error("User ID already exists");

    const newUser = userRepository.create({
      userid: uuidv4(),
      ...data,
    });
    return await userRepository.save(newUser);
  }

  static async getAllUsers() {
    const userRepository = general.getRepository(User);
    return await userRepository.find({
      relations: ["braindumps", "calendars", "images", "tags", "tasks"],
    });
  }

  static async getUserById(id: string) {
    const userRepository = general.getRepository(User);
    const user = await userRepository.findOne({
      where: { userid: id },
      relations: ["braindumps", "calendars", "images", "tags", "tasks"],
    });
    if (!user) throw new Error("User not found");
    if (user.datedeleted) throw new Error("User has been deleted");
    return user;
  }

  static async updateUser(id: string, data: Partial<User>) {
    const userRepository = general.getRepository(User);
    const user = await userRepository.findOne({ where: { userid: id } });
    if (!user) throw new Error("User not found");

    // Update allowed fields (using entity property names)
    if (data.userbsid) user.userbsid = data.userbsid;
    if (data.username) user.username = data.username;
    if (data.email) user.email = data.email;

    return await userRepository.save(user);
  }

  static async deleteUser(id: string) {
    const userRepository = general.getRepository(User);
    const user = await userRepository.findOne({
      where: { userid: id },
      relations: ["braindumps", "calendars", "images", "tags", "tasks"],
    });

    if (!user) throw new Error("User not found");

    // Check for associated data using entity relation properties
    if (
      user.braindumps.length > 0 ||
      user.calendars.length > 0 ||
      user.images.length > 0 ||
      user.tags.length > 0 ||
      user.tasks.length > 0
    ) {
      throw new Error("Cannot delete user with associated data");
    }

    await userRepository.remove(user);
  }
}
