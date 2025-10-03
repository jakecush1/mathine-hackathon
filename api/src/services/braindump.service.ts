import general from "../config/genDataSource";
import { Braindump } from "../entity/general/braindump.entity";
import { UserService } from "./user.service";
import { v4 as uuidv4 } from "uuid";

export class BraindumpService {
  static async createBraindump(data: Partial<Braindump>, netlink: string) {
    // Validation
    if (data.boardpositionx === undefined)
      throw new Error("boardpositionx is required");
    if (data.boardpositiony === undefined)
      throw new Error("boardpositiony is required");
    if (data.boardsizex === undefined)
      throw new Error("boardsizex is required");
    if (data.boardsizey === undefined)
      throw new Error("boardsizey is required");

    const braindumpRepository = general.getRepository(Braindump);

    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    // Create new braindump
    const newBraindump = braindumpRepository.create({
      ...data,
      braindumpid: uuidv4(),
      user, // Assign authenticated user
    });

    return await braindumpRepository.save(newBraindump);
  }

  static async getAllBraindumps(netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const braindumpRepository = general.getRepository(Braindump);
    return await braindumpRepository.find({
      where: { user: { userid: user.userid } },
    });
  }

  static async getBraindumpById(id: string, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const braindumpRepository = general.getRepository(Braindump);
    const braindump = await braindumpRepository.findOne({
      where: { braindumpid: id, user: { userid: user.userid } },
    });

    if (!braindump) throw new Error("Braindump not found or not owned by user");
    return braindump;
  }

  static async updateBraindump(
    id: string,
    data: Partial<Braindump>,
    netlink: string
  ) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const braindumpRepository = general.getRepository(Braindump);
    const braindump = await braindumpRepository.findOne({
      where: { braindumpid: id, user: { userid: user.userid } },
      relations: ["user"],
    });

    console.log("user, braindump:", user, braindump);

    if (!braindump) throw new Error("Braindump not found or not owned by user");

    // Update fields
    if (data.content !== undefined) braindump.content = data.content;
    if (data.colour !== undefined) braindump.colour = data.colour;
    if (data.boardpositionx !== undefined)
      braindump.boardpositionx = data.boardpositionx;
    if (data.boardpositiony !== undefined)
      braindump.boardpositiony = data.boardpositiony;
    if (data.boardsizex !== undefined) braindump.boardsizex = data.boardsizex;
    if (data.boardsizey !== undefined) braindump.boardsizey = data.boardsizey;

    return await braindumpRepository.save(braindump);
  }

  static async deleteBraindump(id: string, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const braindumpRepository = general.getRepository(Braindump);
    const braindump = await braindumpRepository.findOne({
      where: { braindumpid: id, user: { userid: user.userid } },
    });

    if (!braindump) throw new Error("Braindump not found or not owned by user");
    await braindumpRepository.remove(braindump);
  }
}
