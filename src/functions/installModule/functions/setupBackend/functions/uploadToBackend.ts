import axios from "axios";
import { t } from "../../../../../core/api";
import ora from "ora";

export default async function uploadToBackend(
  zippedBuffer: Buffer,
  moduleName: string,
  apiHost: string,
  sessionToken: string
) {
  const spinner = ora(t("messages.uploadingToBackend")).start();

  const formData = new FormData();
  formData.append("file", new Blob([zippedBuffer]), "backend.zip");
  formData.append("name", moduleName);

  const response = await axios
    .post(`${apiHost}/modules/install`, formData, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })
    .catch((error) => {
      spinner.fail(t("messages.failedToUploadBackend"));
      throw new Error(error.response.data.message);
    });

  if (response.status !== 200) {
    spinner.fail(t("messages.failedToUploadBackend"));
    throw new Error(response.data.message);
  }

  spinner.succeed(t("messages.uploadToBackendSuccess"));
}
