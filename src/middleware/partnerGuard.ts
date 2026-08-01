import { Request, Response, NextFunction } from "express";

export function isActivePartner(req: any, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      code: "UNAUTHORIZED"
    });
  }

  const role = req.user.role;
  const store = req.user.partnerStore;

  if (role !== "PARTNER") {
    return res.status(403).json({
      error: "Access forbidden: Partner role required",
      code: "NOT_A_PARTNER"
    });
  }

  if (!store || store.approvalStatus !== "ACTIVE") {
    return res.status(403).json({
      error: "Active partner status required. Partner store approval is not ACTIVE.",
      code: "PARTNER_NOT_ACTIVE",
      currentStatus: store ? store.approvalStatus : "NONE"
    });
  }

  req.partnerStore = store;
  return next();
}
