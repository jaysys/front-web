import Image from "next/image";
import styles from "./page.module.css";
import ImageInfoPage from "./imageinfo/page";
import BatchJob from "./batchjob/page";

export default function Home() {
  return (
    <div className={styles.page}>
      <p>STRAW Api testing with React/Nextjs</p>
      <ImageInfoPage />
      <BatchJob />
    </div>
  );
}
