import general from "../config/genDataSource";
import { Image } from "../entity/general/image.entity";
import { UserService } from "./user.service";
import { v4 as uuidv4 } from "uuid";

export class ImageService {
  static async createImage(data: Partial<Image>, netlink: string) {
    // Validation
    if (!data.imageurl?.trim()) throw new Error("Image URL is required");
    if (!data.imagecategory?.trim()) throw new Error("Image category is required");
    if (typeof data.progress !== 'number') throw new Error("Progress must be a number");

    const imageRepository = general.getRepository(Image);
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const newImage = imageRepository.create({
      imageid: uuidv4(),
      ...data,
      user
    });

    return await imageRepository.save(newImage);
  }

  static async getAllImages(netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const imageRepository = general.getRepository(Image);
    return await imageRepository.find({
      where: { user: { userid: user.userid } },
      relations: ['user']
    });
  }

  static async getImageById(id: string, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const imageRepository = general.getRepository(Image);
    const image = await imageRepository.findOne({
      where: { imageid: id, user: { userid: user.userid } },
      relations: ['user']
    });
    
    if (!image) throw new Error("Image not found or not owned by user");
    return image;
  }

  static async updateImage(id: string, data: Partial<Image>, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const imageRepository = general.getRepository(Image);
    const image = await imageRepository.findOne({
      where: { imageid: id, user: { userid: user.userid } },
      relations: ['user']
    });
    
    if (!image) throw new Error("Image not found or not owned by user");

    // Update fields
    if (data.imageurl) image.imageurl = data.imageurl;
    if (data.imagecategory) image.imagecategory = data.imagecategory;
    if (typeof data.progress === 'number') image.progress = data.progress;
    if (data.revealeddate !== undefined) image.revealeddate = data.revealeddate;

    return await imageRepository.save(image);
  }

  static async deleteImage(id: string, netlink: string) {
    const user = await UserService.createOrGet(netlink);
    if (!user) throw new Error("User not found or could not be created");

    const imageRepository = general.getRepository(Image);
    const image = await imageRepository.findOne({
      where: { imageid: id, user: { userid: user.userid } }
    });
    
    if (!image) throw new Error("Image not found or not owned by user");
    await imageRepository.remove(image);
  }
}