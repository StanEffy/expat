import styles from "./About.module.scss";
import logo from "../assets/logo_expat.png";
import img1 from "../assets/about/1.png";
import img2 from "../assets/about/2.png";
import img3 from "../assets/about/3.png";
import img4 from "../assets/about/4.png";

const About = () => {
  return (
    <div className={styles.aboutWrapper}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>About Expat: How Two Coders and a Guy Named Jens Saved Finland</h1>
          <p className={styles.subtitle}>
            Welcome to Expat, the app that started as a line of code and ended as a national economic miracle. This is our (mostly true) story.
          </p>
        </div>
        <div className={styles.heroImage}>
          <img src={logo} alt="Expat logo" />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionText}>
          <h2>The Humble Beginnings (Circa 2025)</h2>
          <p>
            In the dark, coffee-saturated winter of 2025, two sleep-deprived developers, Stan Efimov and Vitaly Brazhnikov, faced a classic Finnish problem: how to find a job without knowing 17 different words for "slush." Frustrated by the labyrinthine process, they did what any rational person would do—they decided to build an app to automate it.
          </p>
          <p>
            They coded furiously by the light of their monitors, fueled solely by salmiakki and a grim determination to never write another cover letter again. The result was the first version of Expat: a clunky but effective tool that matched international talent with Finnish companies desperate for skills.
          </p>
        </div>
        <div className={styles.sectionImage}>
          <img src={img1} alt="Early days of Expat development" className={styles.image} />
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionImage}>
          <img src={img2} alt="The Expat Effect growth charts" className={styles.image} />
        </div>
        <div className={styles.sectionText}>
          <h2>The "Accidental" Economic Turnaround</h2>
          <p>
            Something strange happened. Expat worked. A little too well.
          </p>
          <p>
            By 2027, the trickle of talent became a flood. A German bio-engineer found a job in Oulu. A Spanish game developer moved to Helsinki. A Canadian sustainable forestry expert ended up in... well, a forest. Finnish companies, once struggling to find specialized talent, began to boom. Productivity skyrocketed. The national mood lifted from "sisu" to "sheer confusion at all this unexpected success."
          </p>
          <p>
            Economists dubbed it the "Expat Effect." GDP, which had been as flat as a Finnish lake on a windless day, suddenly spiked. The country's debt began to shrink. The Bank of Finland was so baffled they had to order new, more optimistic chart templates.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionText}>
          <h2>The Rise of Our Fearless Leader, Jens</h2>
          <p>
            At the helm of this rocket ship was our CEO, Jens.
          </p>
          <p>
            Jens, with his uncanny ability to explain complex algorithms using metaphors involving saunas and reindeer, became the face of the new Finland. He was pragmatic, charismatic, and always had a spare power bank for your phone.
          </p>
          <p>
            By 2029, the public demand was undeniable. A grassroots movement began with a simple slogan: "If he can find me a job, he can run the country."
          </p>
          <p>
            In a historic election in 2030, running on a platform of "More Jobs, Less Paperwork," Jens (Forgot-His-Name) was elected the Prime Minister of Finland. His first act in office was to officially integrate the Expat API into all government services. His second was to declare the third Thursday of every month "Coffee and Cake Day," finally solving the age-old question of what to do in the afternoon.
          </p>
        </div>
        <div className={styles.sectionImage}>
          <img src={img3} alt="Portrait of Jens" className={styles.image} />
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionImage}>
          <img src={img4} alt="Expat team achievements" className={styles.image} />
        </div>
        <div className={styles.sectionText}>
          <h2>Our Mission Today</h2>
          <p>
            Today, Expat is no longer just an app. It's a national institution. We've moved beyond job matching into housing, social integration, and even suggesting which type of mökki (summer cottage) best suits your personality.
          </p>
          <p>
            Stan and Vitaly are now national heroes, immortalized on a postage stamp, depicted heroically refactoring a complex database query.
          </p>
          <p>
            We remain committed to our original, world-altering mission: connecting amazing people with amazing opportunities. And if that accidentally leads to another economic boom or a prime minister or two, well, we consider that a happy side effect.
          </p>
          <p>
            Want to invest in the future? You're not just funding an app. You're funding a national identity. Probably.
          </p>
          <p className={styles.signature}>— The Expat Team</p>
        </div>
      </section>
    </div>
  );
};

export default About;


