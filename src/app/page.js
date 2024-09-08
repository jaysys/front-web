import styles from "@/styles/page.module.css";
import FindImgDiffComponent from "./components/FindImgDiffComponent";
import ImageInfoComponent from "./components/ImageInfoComponent";
import BatchJobComponent from "./components/BatchJobComponent";
import ImageDispComponent from "./components/ImageDispComponent";
import WelcomePage from "./features/WelcomePage";

export default function Home() {
  return (
    <div className={styles.page}>
      <WelcomePage />
      <p>STRAW Api testing with React/Nextjs</p>
      <ImageInfoComponent />
      <ImageDispComponent />
      <FindImgDiffComponent />
      <BatchJobComponent />
    </div>
  );
}
