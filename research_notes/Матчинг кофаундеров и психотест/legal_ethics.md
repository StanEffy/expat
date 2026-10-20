# Legal and ethical constraints for personality and capability profiling plus co-founder/collaborator matching (EU, status as of October 2026)

> These are research notes, not legal advice. Status was checked on 20 Oct 2026. Several items are still moving (the GDPR part of the Digital Omnibus, and the final Commission guidelines on high-risk classification). Much of the commentary used is secondary (law-firm and practitioner analyses). Primary texts should be checked before any decision.

## 1. GDPR: special categories, profiling and automated decisions, consent, DPIA, minimisation, erasure, visibility, nationality and immigration status

### Takeaway
Personality-test scores are **not listed** as special category data under Art. 9. However, the CJEU reads "revealing" broadly: data from which a sensitive trait can be **inferred** counts. Neuroticism, anxiety or depression-like scales and wellbeing items can therefore become **health data**, and nationality can become a proxy for **racial or ethnic origin**. The platform builds profiles of "the personality of data subjects" to generate contact suggestions. That is explicitly on the German DSK mandatory DPIA list (item 9: "dating and contact portals"), so **a DPIA should be treated as mandatory**. Art. 22 is probably not triggered by non-binding suggestions, but transparency duties on profiling still apply.

### Cited Findings
- **Broad reading of Art. 9.** In C-184/20 (OT, 2022) the CJEU held that data which are not inherently sensitive fall under Art. 9(1) if they allow sensitive information to be deduced "through an intellectual operation involving comparison or deduction". In C-21/23 (Lindenapotheke, 4 Oct 2024), online orders of non-prescription pharmacy products were held to be health data, against the Advocate General's context-dependent view. — [Baker McKenzie](https://connectontech.bakermckenzie.com/sensitive-data-under-the-cjeus-spotlight-practical-implications/); [Bird & Bird](https://cm.twobirds.com/en/insights/2024/global/feeling-unwell-after-the-cjeus-lindenapotheke-decision); [Van Bael & Bellis](https://www.vbb.com/media/Newsletters/CLIENT_ALERT_-_CJEU_Adopts_Broad_Interpretation_of_Special_Personal_Data.pdf)
- **Commentators' reading of OT, Meta (C-252/21) and Lindenapotheke.** Taken together, "revealing" does not require explicit disclosure, and the mere possibility of inference can suffice. — [Baker McKenzie](https://connectontech.bakermckenzie.com/sensitive-data-under-the-cjeus-spotlight-practical-implications/)
- **Digital Omnibus, GDPR track.**
  - The Nov 2025 leaked draft would have narrowed Art. 9 to data that *directly* reveal sensitive traits, so that inferred traits would lose automatic protection. — [Gibson Dunn](https://www.gibsondunn.com/eu-digital-omnibus-package-a-first-look-at-the-commission-draft-proposals/)
  - The published proposal reportedly dropped that narrowing but added an Art. 9 derogation for residual special category data in AI development and operation. — [Lewis Silkin](https://www.lewissilkin.com/insights/2025/12/02/has-the-eu-been-sic-omnibus-or-do-all-roads-lead-to-a-new-world-of-data-and-ai-eu-deregulation); [Taylor Wessing](https://www.taylorwessing.com/de/global-data-hub/2026/the-digital-omnibus-proposal/gdh----the-digital-omnibus-and-gdpr)
  - A secondary source says the EDPB and EDPS rejected Art. 9 narrowing in a Feb 2026 joint opinion. I did not verify this against the primary document. — [Baker McKenzie via search summary](https://connectontech.bakermckenzie.com/sensitive-data-under-the-cjeus-spotlight-practical-implications/)
  - Sources conflict on whether the narrowing appears in the current text. Treat as unresolved.
- **Status of the GDPR Omnibus, October 2026.**
  - The Council still has no negotiating mandate. Coreper II did not vote on the Irish Presidency compromise on 11 Oct 2026, after pressure from France and Germany.
  - The joint LIBE/ITRE draft report in Parliament is dated 22 June 2026, with roughly 1,750 to 1,840 amendments tabled.
  - Final adoption is not expected before late 2026 at the earliest. **The current GDPR text applies unchanged.**
  - Sources: [Agence Europe](https://agenceurope.eu/en/bulletin/article/13954/5/vote-on-digital-omnibus-postponed-until-11-october-under-pressure-from-paris-and-berlin); [PrivacyNext](https://www.privacynext.eu/resources/digital-omnibus-gdpr-negotiations-at-the-council-september-2026-update/); [Acompli](https://acompli.ie/news/digital-omnibus-gdpr-cookies-status-september-2026/); [EUTechReg](https://research.eutechreg.com/dossiers/gdpr-reform-digital-omnibus/)
- **DPIA, German DSK mandatory list (non-public sector, v1.1).**
  - **Item 9** reads: "Erstellung umfassender Profile über die Interessen, das Netz persönlicher Beziehungen oder die Persönlichkeit der Betroffenen". The typical use is "Betrieb von Dating- und Kontaktportalen" and large social networks. The example given is a portal that profiles users "um möglichst passende Kontaktvorschläge zu generieren".
  - **Item 11** covers the use of AI to process personal data "zur Bewertung persönlicher Aspekte der betroffenen Person".
  - **Item 13** covers automated analysis of video or audio "zur Bewertung der Persönlichkeit".
  - Source: [DSK DSFA-Liste v1.1, via HmbBfDI (PDF)](https://datenschutz-hamburg.de/fileadmin/user_upload/HmbBfDI/Datenschutz/Informationen/DSFA_Muss-Liste_fuer_den_nicht-oeffentlicher_Bereich_-_Stand_17.10.2018.pdf)
- **EDPB/WP29 WP248 criteria.** There are nine high-risk criteria, including:
  - evaluation or scoring
  - automated decisions with legal or similar effect
  - sensitive or highly personal data
  - large scale
  - matching or combining datasets
  - vulnerable data subjects
  - innovative technology
  - preventing someone from using a service

  Meeting two criteria generally requires a DPIA, and sometimes one is enough. — [SCL summary](https://www.scl.org/10311-when-to-conduct-dpias/); [Simmons & Simmons on the CNIL list](https://www.simmons-simmons.com/en/publications/ck0bcc809o1jf0b85opoqi6l2/271118-french-data-protection-impact-assessment)
- **CNIL list (Oct 2018, 14 types).** It includes profiling that may lead to exclusion from a contract, profiling for HR purposes, and profiling using data from external sources. The list is non-exhaustive. — [Simmons & Simmons](https://www.simmons-simmons.com/en/publications/ck0bcc809o1jf0b85opoqi6l2/271118-french-data-protection-impact-assessment)
- **ICO list (UK, relevant if UK users).** It covers "any profiling of individuals on a large scale" (social networks named as an example), data matching from multiple sources, and decisions about access to an "opportunity" based on automated decision-making or special category data. — [ICO](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/examples-of-processing-likely-to-result-in-high-risk/)
- **Primary texts.**
  - GDPR Art. 4(4) (profiling definition), 9, 13(2)(f)/14(2)(g) (meaningful information about the logic of automated decision-making), 17 (erasure), 21 (objection to profiling), 22 and 35: [EUR-Lex, GDPR 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
  - EDPB-endorsed WP251 guidelines on automated decision-making and profiling: [EDPB](https://ec.europa.eu/newsroom/article29/items/612053)

### Inferences
- **Which data may become special category.**
  - Most likely: neuroticism or emotional-stability scores, any items on mood, stress, anxiety, ADHD or neurodivergence, wellbeing, or medication, and free-text answers. These could reveal health or mental-health data under the OT/Lindenapotheke logic.
  - Also possible: values or "openness" items touching religion or politics.
  - Nationality, native language and country of origin are not Art. 9 data in themselves, but combined they can reveal ethnic origin, especially if used as a matching feature.
  - The safest design is either (a) a Big Five-style instrument with no clinical items and no health-related labels, or (b) treating the whole profile as potentially Art. 9 data and relying on **explicit consent (Art. 9(2)(a))** for it.
- **Consent design.**
  - Use separate, granular opt-ins: (1) taking the test, (2) using the results for matching, (3) showing results to other users.
  - Consent must be freely given, so declining must not degrade core platform features (Art. 7(4)).
  - Withdrawal must be as easy as giving consent and must stop matching use.
- **Art. 22.** A ranked list of suggested collaborators that the user is free to ignore is probably not a "decision" with "legal or similarly significant effects". This is especially true if users initiate contact themselves. If the recommender ever excludes people from opportunities such as accelerator slots or funding pools, or feeds hiring, it moves toward Art. 22 territory.
  - Even without Art. 22, profiling must be disclosed (Arts. 13 and 14) and users have the Art. 21 right to object.
- **DPIA.** Several WP248 criteria are met: evaluation or scoring, highly personal data, combining test and questionnaire data with graph data, possibly vulnerable subjects (migrants), and innovative technology. DSK item 9 matches almost exactly. **Treat the DPIA as mandatory.**
- **Minimisation.** Store domain-level scores rather than raw item responses, or delete raw responses after scoring. Avoid storing clinical-sounding labels. Do not use nationality, gender or religion as matching features unless the user chooses them as an explicit filter.
- **Erasure (Art. 17).** On consent withdrawal, delete the scores, embeddings, graph edges and cached recommendations derived from the profile. Retrain or purge any model features computed from them.
- **Visibility.** Results should be private by default. Sharing them with others should be a separate opt-in, not bundled with matching.
- **Immigration status.** Residence or visa status is not Art. 9 data, but it is highly sensitive: risks of discrimination, risks if data reach authorities or employers, and power imbalance. Treat it as WP248 "highly personal data". Avoid collecting it for matching, or keep it optional and never displayed by default.

### Gaps
- I did not retrieve the EDPB/EDPS Feb 2026 joint opinion on the Omnibus directly.
- The exact current Commission/Council text on inferred special category data is unclear (the sources conflict).
- I did not find DPA guidance or case law specifically on whether personality inventories (for example Big Five) are health data. The conclusions above are inferences from CJEU principles.
- I did not verify the current CNIL list text directly, only via a 2018 secondary source.
- The DSK list consulted is v1.1 (2018). I did not check whether a newer version exists.

## 2. EU AI Act: Annex III point 4 and other points, Art. 5 prohibitions, Art. 50 transparency, and the timeline after the Digital Omnibus

### Takeaway
The AI part of the Digital Omnibus is law: **Regulation (EU) 2026/1744**, in force since **27 Jul 2026**. It moved Annex III high-risk obligations from 2 Aug 2026 to **2 Dec 2027**.

The Commission's draft guidelines (May 2026) read Annex III point 4 ("employment, workers' management and access to self-employment") **broadly and functionally**. Freelancers and self-employed people are covered, and AI that "meaningfully shapes access" through scores, rankings or shortlists is in scope even if a human decides.

Pure peer-to-peer co-founder matching is **not clearly** in point 4, because it concerns venture formation between peers, not recruitment or work allocation. It is a grey zone, however. If the system ranks people for opportunities, or bleeds into hiring or gig features, it can become high-risk.

Art. 5 prohibitions have applied since Feb 2025. Migration and refugee status is expressly a "specific social or economic situation" under Art. 5(1)(b), but that prohibition requires exploitation that materially distorts behaviour and causes significant harm.

### Cited Findings
- **Omnibus timeline.**
  - The Council approved the AI Omnibus on 29 Jun 2026. It was published as Regulation (EU) 2026/1744 and entered into force on 27 Jul 2026.
  - Annex III high-risk obligations now apply from 2 Dec 2027. Annex I obligations apply from 2 Aug 2028, and public-authority systems from 2 Aug 2030.
  - Art. 50 transparency was **not** delayed. Only providers of generative systems already on the market before 2 Aug 2026 get until 2 Dec 2026 for Art. 50(2) marking.
  - Sources: [Orrick, Jul 2026](https://www.orrick.com/en/Insights/2026/07/EU-AI-Act-Update-Digital-Omnibus-Finalizes-8-Compliance-Changes); [Cooley](https://cdp.cooley.com/digital-ai-omnibus-delays-key-deadlines-introduces-new-rules/); [Sidley, provisional agreement 22 Jun 2026](https://datamatters.sidley.com/2026/06/22/eu-lawmakers-reach-provisional-agreement-to-delay-key-eu-ai-act-obligations/); [AI Act Explorer](https://artificialintelligenceact.eu/ai-act-explorer/digital-omnibus/)
  - The exact Official Journal publication date is reported as 24 Jul 2026 by search summaries, which I did not verify directly.
- **Other Omnibus changes.**
  - The Art. 10(5) legal basis for processing special category data for bias detection and correction is extended beyond high-risk providers, under "strict necessity" and safeguards (pseudonymisation, access control, deletion).
  - A new "small mid-cap" category (fewer than 750 staff) gets SME-style relief.
  - Two new Art. 5 bans (non-consensual intimate imagery and CSAM) apply from 2 Dec 2026.
  - Systems placed on the market before 2 Dec 2027 are generally covered only if substantially modified afterwards.
  - Sources: [Orrick](https://www.orrick.com/en/Insights/2026/07/EU-AI-Act-Update-Digital-Omnibus-Finalizes-8-Compliance-Changes); [McCann FitzGerald](https://www.mccannfitzgerald.com/knowledge/data-privacy-and-cyber-risk/employment-spotlight-eu-ai-act-draft-guidelines-on-high-risk-ai-classification)
- **Draft Commission guidelines on high-risk classification (published 19 May 2026, consultation closed 23 Jun 2026).**
  - Point 4 covers freelancers, independent professionals, platform workers and self-employed persons, with "work-related contractual relationships" read broadly.
  - The Art. 6(3) filter does not exempt any system that performs profiling.
  - Sources: [McCann FitzGerald](https://www.mccannfitzgerald.com/knowledge/data-privacy-and-cyber-risk/employment-spotlight-eu-ai-act-draft-guidelines-on-high-risk-ai-classification); [Faegre Drinker, 15 Jun 2026](https://www.faegredrinker.com/en/insights/publications/2026/6/draft-commission-guidelines-on-high-risk-ai-implications-for-the-workplace); [Addleshaw Goddard](https://www.addleshawgoddard.com/en/insights/insights-briefings/2026/technology/eu-ai-act-draft-commission-guidelines-classification-high-risk-ai-systems/)
- **Functional test in the draft guidelines.** If AI meaningfully shapes access to roles through suitability scores, shortlists or rankings, it is in scope even with a human making the final decision.
  - High-risk examples: automated job matching and ranking, cross-platform sourcing that builds recruiter shortlists, targeted job ads.
  - Not high-risk examples: a job recommender that the applicant runs for themselves, and optional courier area recommendations that carry no penalty if ignored.
  - Source: [Faegre Drinker](https://www.faegredrinker.com/en/insights/publications/2026/6/draft-commission-guidelines-on-high-risk-ai-implications-for-the-workplace)
- **Conflict on one example.** Faegre Drinker lists "a platform ranking self-employed service providers for customer display" as **high-risk**. A search-result summary of other commentary placed it in the **not high-risk** column. Treat this as unresolved until the final guidelines are out.
- **Status of the guidelines.** I found no source confirming that the final guidelines have been adopted as of Oct 2026.
- **Art. 5(1)(b), per the Commission guidelines on prohibited practices (Feb 2025, non-binding).**
  - "Specific social or economic situation" includes "extreme poverty, temporary unemployment, over-indebtedness, migration or refugee status". Loneliness or grievance alone does not qualify.
  - The system must actively exploit the vulnerability, with material distortion of behaviour and significant harm.
  - Sources: [Modulos summary of the guidelines](https://docs.modulos.ai/frameworks/eu-ai-act/commission-guidance/prohibited); [Orrick](https://www.orrick.com/en/insights/2025/04/eu-commission-publishes-guidelines-on-the-prohibited-ai-practices-under-the-ai-act); [Bundesnetzagentur](https://bundesnetzagentur.de/EN/Areas/Digitalisation/AI/08_ProhibitedPractices/start.html)
- **Art. 5(1)(f), emotion recognition.** It is banned in workplaces (read broadly, including digital work contexts) and educational institutions, except strictly for medical or safety reasons.
  - It is linked to the AI Act definition of an emotion recognition system, which is based on **biometric data** (Art. 3(39) of the AI Act). The Modulos summary did not confirm this point, so check the primary text.
  - Sources: [Modulos](https://docs.modulos.ai/frameworks/eu-ai-act/commission-guidance/prohibited); [AI Act text, EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)

### Inferences
- **Annex III point 4.** A peer co-founder recommender for voluntary collaboration is arguably outside point 4. It neither recruits, selects, allocates work nor evaluates for a work relationship. Still, "access to self-employment" plus the broad functional reading creates real risk, particularly if:
  - (a) the same scores are reused by the platform's job or hiring features;
  - (b) recommendations gate access to paid opportunities, such as accelerator programmes, freelance gigs or investor intros; or
  - (c) third parties such as investors or companies can search and rank users by personality or capability scores.
  - Strict architectural and purpose separation from the job features is the main mitigation. If in scope, obligations apply only from 2 Dec 2027, and legacy systems only on substantial modification.
- **Other Annex III points.**
  - Point 1 (biometrics, including biometric categorisation) is not relevant unless photos, voice or video are analysed.
  - Point 5 (access to essential private and public services and benefits) is unlikely to apply.
  - Point 7 (migration, asylum and border control) is aimed at public authorities, so it does not apply.
- **Art. 5(1)(f).** A text questionnaire does not use biometric data, so it is not emotion recognition. Inferring emotions from video calls or voice would be risky, and banned if used in a workplace context.
- **Art. 5(1)(b).** Migrants count as a vulnerable group. Manipulative design aimed at them, for example pushing paid "verified matches" by playing on isolation or visa anxiety, could approach the prohibition. Ordinary matching does not.
- **Art. 50.** If a chatbot or AI assistant interacts with users (for example, explaining matches), users must be told that they are interacting with AI. AI-generated content such as profile summaries may need marking.
- **Bias detection.** The extended Art. 10(5)-style basis may help justify limited processing of sensitive attributes for fairness audits, under strict necessity.

### Gaps
- The final text of the Commission guidelines on Art. 6 and Annex III was not confirmed as adopted.
- No authoritative source addresses co-founder or peer matching specifically under "access to self-employment".
- The Official Journal date of 2026/1744 was not verified from EUR-Lex directly.

## 3. DSA Art. 27 recommender transparency for small platforms

### Takeaway
Art. 27 is in DSA Chapter III Section 3. Under **Art. 19**, that whole section (except Art. 24(3)) does **not apply to micro or small enterprises** (Recommendation 2003/361/EC). A startup with fewer than 50 staff and under EUR 10m turnover is exempt unless it is designated a VLOP. Following Art. 27 voluntarily is still good practice.

### Cited Findings
- Art. 19(1): "This Section, with the exception of Article 24(3) thereof, shall not apply to providers of online platforms that qualify as micro or small enterprises". The exemption continues for 12 months after a provider loses that status, except for VLOPs. — [Springlex, DSA Art. 19](https://www.springlex.eu/en/packages/dsa/dsa-regulation/article-19/); [Prighter](https://prighter.com/resources/laws/dsa/articles/article-19)
- Art. 27 requires the main parameters of recommender systems, and any user options to modify them, to be set out in the terms of service. The obligation for at least one option *not based on profiling* is in Art. 38, which applies only to VLOPs and VLOSEs. A secondary source mislabelled that requirement as part of Art. 27. — [Presencis Art. 27](https://presencis.com/regulations/dsa/article-27/); [DSA, EUR-Lex](https://eur-lex.europa.eu/eli/reg/2022/2065/oj)
- Threshold figures from secondary sources: micro means fewer than 10 staff and at most EUR 2m; small means fewer than 50 staff and at most EUR 10m. — [Presencis Art. 19](https://cdn.presencis.com/regulations/dsa/article-19/)

### Inferences
- **Is it an "online platform"?** The app is probably one if user profiles are disseminated to other users (that is, made public). If profiles are visible only to matched users, hosting-service status may be closer. In either case the small-enterprise exemption likely removes Art. 27.
- **Voluntary practice.** Publishing "why am I seeing this person" and offering a non-personalised browse mode are cheap and build trust.

### Gaps
- I did not verify the Recommendation 2003/361 thresholds from the primary text, or how partner and linked enterprises are aggregated.
- I did not find any 2026 DSA amendments affecting Art. 19 or Art. 27.

## 4. Ethics: fairness in people recommendation, label stigma, informed consent, psychological-association guidance

### Takeaway
Research shows that people recommenders interact with **homophily** in ways that can systematically change minority visibility and reinforce "rich-get-richer" exposure. For an expat platform, nationality- or language-based similarity could entrench national silos and disadvantage some groups.

Professional testing standards (ITC, EFPA) emphasise qualified use, appropriate instruments, informed consent, confidentiality and careful feedback. Using a personality test as a gate for collaboration goes beyond what such instruments are validated for.

### Cited Findings
- **Fabbri, Bonchi, Boratto and Castillo (ICWSM 2020).** Homophily plays a key role in whether people recommenders promote or reduce the visibility of minority groups, across datasets and algorithms. — [ICWSM paper](https://ojs.aaai.org/index.php/ICWSM/article/view/7288)
- **Follow-up work.** Link recommenders strengthen individual-level exposure inequality ("rich-get-richer") for both majority and minority groups. Homophilic minorities can be over-exposed and heterophilic minorities under-exposed. — [arXiv 2112.08237](https://www.arxiv.org/abs/2112.08237)
- **ITC Guidelines on Test Use.** Adopted in 1999 and published in 2000, they are the international reference for competent test use. The ITC also has guidelines for computer-based and internet-delivered testing, and the ITC/ATP Guidelines for Technology-Based Assessment (2022). — [IAAP Division 2](https://www.iaapsy.org/division-2); [ITC](https://www.intestcom.org/page/17); [Bartram 2001, Hogrefe](https://econtent.hogrefe.com/doi/abs/10.1027//1015-5759.17.3.173)
- **Implementation differs by country.** There is broad agreement on good test-use practice, but implementation and regulation vary widely between countries. EFPA's Standing Committee on Tests and Testing sets European standards on test use. — [Bartram 2001](https://econtent.hogrefe.com/doi/abs/10.1027//1015-5759.17.3.173); [IAAP](https://www.iaapsy.org/division-2)

### Inferences
- **Fairness.**
  - Do not optimise purely for similarity. Add diversity and exposure constraints, such as caps on how often top profiles are recommended and cross-nationality exploration.
  - Audit exposure by gender, nationality or region and language. Under GDPR, aggregate audits need careful handling, which the Omnibus Art. 10(5)-style basis may support.
  - Avoid letting users hard-filter by nationality or gender for co-founding, or at least do not make it default. Such filters risk discrimination, although EU non-discrimination directives mainly cover employment and services rather than private partner choice. This was not researched in depth.
- **Labels and stigma.**
  - Avoid typologies or clinical-sounding labels ("unstable", "neurotic"). Use neutral dimensional descriptions with uncertainty.
  - Never display scores publicly by default.
  - Frame results as self-reported preferences and work styles, not fixed traits or "fit" verdicts.
- **Validity.** Personality–team performance links are modest. Do not present compatibility scores as predictive of venture success.
- **Professional standards, inferred from ITC and EFPA principles.**
  - Use a validated, openly licensed instrument (for example an IPIP-based Big Five) rather than a proprietary or clinical one.
  - Give an informed-consent screen explaining purpose, use, visibility, retention and the limits of interpretation.
  - Provide feedback that is understandable and non-diagnostic.
  - Allow retakes and self-editing.
  - Do not use instruments outside their validated purpose.

### Gaps
- I did not retrieve the specific text of the ITC Test Use Guidelines or EFPA test-user standards on non-professional, self-service online personality tests.
- I did not retrieve BPS guidance on this topic.
- No sourced evidence was gathered on personality similarity versus complementarity in co-founder success.

## 5. Practical recommendations: separation from hiring, explainability, opt-in visibility, human-in-the-loop

### Takeaway
The lowest-risk design is a **voluntary, purpose-limited and user-controlled** cooperation recommender, kept strictly separate from job and hiring features. It should have a mandatory DPIA, explicit granular consent, minimised non-clinical data, private-by-default results, explanations, and user-initiated contact. This keeps it outside Art. 22 and, most likely, outside AI Act Annex III point 4. It also keeps the platform ready for possible scope creep before 2 Dec 2027.

### Cited Findings
- The Art. 6(3) filter does not exempt systems that perform profiling, and human involvement alone does not remove high-risk classification. — [McCann FitzGerald](https://www.mccannfitzgerald.com/knowledge/data-privacy-and-cyber-risk/employment-spotlight-eu-ai-act-draft-guidelines-on-high-risk-ai-classification); [Faegre Drinker](https://www.faegredrinker.com/en/insights/publications/2026/6/draft-commission-guidelines-on-high-risk-ai-implications-for-the-workplace)
- Recommendation tools that the candidate runs for themselves are cited as not high-risk, while tools that rank people for third parties are. — [Faegre Drinker](https://www.faegredrinker.com/en/insights/publications/2026/6/draft-commission-guidelines-on-high-risk-ai-implications-for-the-workplace)
- Contact-suggestion profiling based on personality requires a DPIA in Germany. — [DSK list item 9](https://datenschutz-hamburg.de/fileadmin/user_upload/HmbBfDI/Datenschutz/Informationen/DSFA_Muss-Liste_fuer_den_nicht-oeffentlicher_Bereich_-_Stand_17.10.2018.pdf)

### Inferences (recommendations)
1. **Purpose separation.**
   - Store test and capability data in a separate store, with a documented purpose ("peer cooperation discovery").
   - Technically block reuse by job, hiring or employer features, and by any third-party search.
   - Record this in the DPIA and the privacy notice, and write it into the terms of service.
2. **User-side tool framing.**
   - Recommendations are shown only to the user, who decides whether to contact anyone.
   - No exclusion from opportunities.
   - No exposure to employers or investors of rankings built on psychological scores.
3. **Consent and visibility.**
   - Three separate toggles: test, matching use, and profile visibility (with options for private, matches only, or public, plus per-dimension sharing).
   - Default to private.
   - Withdrawing consent removes the derived data and graph edges.
4. **Data minimisation and instrument choice.**
   - Non-clinical Big Five or work-style items only.
   - Drop or avoid emotional-stability wording, or treat it as Art. 9 data.
   - Store aggregate scores, not raw items.
   - Set a retention limit, for example deletion after a defined period of inactivity.
   - Make nationality and immigration status optional and exclude them from matching features by default.
5. **Explainability.**
   - Show "why this person" with the main factors (shared skills, complementary roles, stated goals), not opaque personality scores.
   - Document the parameters in plain language, in the spirit of DSA Art. 27 even if exempt.
   - Provide a non-personalised browse or search alternative.
6. **Human in the loop and contestability.**
   - Let users correct or hide their capability claims, give feedback that a match is irrelevant, and object to profiling (Art. 21).
   - Provide a human support channel.
7. **Fairness monitoring.**
   - Run periodic exposure audits across gender and nationality groups.
   - Use diversity re-ranking.
   - Avoid nationality- or gender-based hard filters.
8. **AI Act readiness.**
   - Keep a short classification memo explaining why the system is not Annex III point 4.
   - Revisit it when the final Commission guidelines publish and before any feature that reuses scores in hiring or gig allocation.
   - Comply with Art. 50 if conversational AI is used.
   - Avoid manipulative upsell targeting migrants' vulnerabilities (Art. 5(1)(b)).
   - Avoid biometric or emotion inference.

### Gaps
- No national DPA enforcement decisions specific to co-founder or networking matching platforms were found.
- How DPAs treat personality data in dating apps (the closest analogue) was not researched in this pass.
