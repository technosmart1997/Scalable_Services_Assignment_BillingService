import { BaseService } from "../../server.js";
import { generateBillHandler } from "./controller.js";

class BillingService extends BaseService {
  constructor(port) {
    super(port);
    this.products = [];
  }

  initializeRoutes() {
    super.initializeRoutes();
    this.router.post("/generate", this.generateBill.bind(this));

    this.router.use("/bill", this.router);
  }

  generateBill(req, res, next) {
    return generateBillHandler(req, res, next);
  }
}

// Start the service
const productService = new BillingService(3001);
productService.listen();
