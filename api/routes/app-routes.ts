import { Router, Request, Response } from "express";
import { APIEndpoints } from "../constants";
import {
  createLink,
  fetchMyLinks,
  updateLink,
} from "../controllers/link-controller";
import { createLinkSchema, updateLinkSchema } from "../models/joi-schemas";

const router = Router();
router.get(
  APIEndpoints.App.BASE_ENDPOINT,
  async (req: Request, res: Response) => {
    console.log(req.cookies);
    if (!req.cookies.linkIds || req.cookies.linkIds.length === 0)
      return res.status(404).send();
    console.log(req.cookies.linkIds);
    try {
      const result = await fetchMyLinks(req.cookies.linkIds);
      res.status(200).json({
        links: result,
      });
    } catch (error) {
      console.log(error);
      res.status(error).send();
    }
  }
);
router.post(
  APIEndpoints.App.BASE_ENDPOINT + APIEndpoints.App.CREATE,
  async (req: Request, res: Response) => {
    try {
      await createLinkSchema.validateAsync(req.body);
    } catch (error) {
      return res.status(400).json(error);
    }

    try {
      const result = await createLink(
        req.body.longUrl,
        req.clientIp,
        req.body.customCode
      );
      let linkIds = Array.isArray(req.cookies.linkIds)
        ? req.cookies.linkIds
        : [];
      linkIds.push(result.linkId);
      res.cookie("linkIds", linkIds, {
        expires: new Date(253402300799999),
      });
      return res.status(201).json({
        link: result,
        linkIds,
      });
    } catch (error) {
      res.status(error.code).send(error);
    }
  }
);
router.put(
  APIEndpoints.App.BASE_ENDPOINT + APIEndpoints.App.UPDATE,
  async (req: Request, res: Response) => {
    try {
      await updateLinkSchema.validateAsync(req.body);
    } catch (error) {
      return res.status(400).json(error);
    }

    try {
      const result = await updateLink(
        req.body.linkId,
        req.body.longUrl,
        req.body.enabled
      );
      return res.status(200).json(result);
    } catch (error) {
      res.status(error).send();
    }
  }
);

export default router;
