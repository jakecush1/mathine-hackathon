import general from "../config/genDataSource";
import { Tag } from "../entity/general/tag.entity";
import { TaskXTag } from "../entity/general/taskxtag.entity";
import { UserService } from "./user.service";
import { v4 as uuidv4 } from "uuid";

export class TagService {
  static async createTag(tagname: string, netlink: string) {
    if (!tagname?.trim()) throw new Error("Tagname is required");

    const tagRepository = general.getRepository(Tag);
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const newTag = tagRepository.create({
      tagid: uuidv4(),
      tagname: tagname,
      user: user,
    });

    return await tagRepository.save(newTag);
  }

  // Get all tags for a specific user
  static async getAllTags(netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const tagRepository = general.getRepository(Tag);
    return await tagRepository.find({
      where: { user: { userid: user.userid } },
      relations: ["user"],
    });
  }

  // Get specific tag only if it belongs to the user
  static async getTagById(id: string, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const tagRepository = general.getRepository(Tag);
    const tag = await tagRepository.findOne({
      where: { tagid: id, user: { userid: user.userid } },
      relations: ["user", "taskxtags"],
    });

    if (!tag) throw new Error("Tag not found or not owned by user");
    return tag;
  }

  // Update tag only if it belongs to the user
  static async updateTag(id: string, tagname: string, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const tagRepository = general.getRepository(Tag);
    const tag = await tagRepository.findOne({
      where: { tagid: id, user: { userid: user.userid } },
      relations: ["user"],
    });

    if (!tag) throw new Error("Tag not found or not owned by user");

    // Update tagname
    if (tagname) tag.tagname = tagname;

    return await tagRepository.save(tag);
  }

  // Delete tag only if it belongs to the user and remove associated TaskXTag entries
  static async deleteTag(id: string, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const tagRepository = general.getRepository(Tag);
    const taskXTagRepository = general.getRepository(TaskXTag);

    const tag = await tagRepository.findOne({
      where: { tagid: id, user: { userid: user.userid } },
      relations: ["taskxtags"], // Load bridge entities
    });

    if (!tag) throw new Error("Tag not found or not owned by user");

    // Delete all associated bridge entities (taskxtags)
    if (tag.taskxtags && tag.taskxtags.length > 0) {
      await taskXTagRepository.remove(tag.taskxtags);
    }

    // Now delete the tag
    await tagRepository.remove(tag);
  }
}
