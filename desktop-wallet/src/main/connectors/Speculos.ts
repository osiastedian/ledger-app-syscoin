import axios from "axios";
import SpeculosTransport from "@ledgerhq/hw-transport-node-speculos-http";
import { DisconnectedDevice } from "@ledgerhq/errors";

const opts = {
  baseURL: "http://127.0.0.1:5002",
};
const axiosInstance = axios.create(opts);
const speculosTransport = new SpeculosTransport(axiosInstance, opts);

export const connect = () => {
  return new Promise<SpeculosTransport>((resolve, reject) => {
    axiosInstance({
      url: "/events?stream=true",
      responseType: "stream",
    })
      .then((response) => {
        response.data.on("data", () => {
          // console.log('Events Stream data', { chunk});
        });
        response.data.on("close", () => {
          speculosTransport.emit(
            "disconnect",
            new DisconnectedDevice("Speculos exited!")
          );
        });
        speculosTransport.eventStream = response.data;
        // we are connected to speculos
        resolve(speculosTransport);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
        reject(error);
      });
  });
};

export default connect;
