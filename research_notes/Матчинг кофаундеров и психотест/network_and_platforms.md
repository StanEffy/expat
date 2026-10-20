# Network Science of Team Formation and Co-Founder / Collaborator Matching Platforms

Research date: 2026-10-20. Context: an expat/immigrant app that builds a graph of people and recommends co-founding or cooperation on any kind of venture (tech and non-tech). Not hiring.

## Q1. Team assembly mechanisms: incumbents vs newcomers, repeat collaborations, small worlds (Guimerà et al. 2005; Uzzi & Spiro 2005)

### Takeaway
Teams do best with a mix: a high share of experienced people ("incumbents"), but low rates of incumbents re-teaming with their *prior* collaborators. Networks that connect into one large component (rather than isolated cliques) are tied to better performance. On Broadway, the benefit of network "small-worldness" rises and then falls (an inverted U). Too much familiarity hurts.

### Cited Findings
- Guimerà, Uzzi, Spiro & Amaral, "Team assembly mechanisms determine collaboration network structure and team performance," *Science* 308:697–702 (2005). The model has three parameters: team size m, p (the probability that a team slot is filled by an incumbent, i.e. the average fraction of incumbents in a team), and q (the propensity of incumbents to repeat past collaborations). There are four link types: newcomer–newcomer, newcomer–incumbent, incumbent–incumbent (new), and repeat incumbent–incumbent. — [Amaral lab citation](https://amaral.northwestern.edu/publications/team-assembly-mechanisms-determine-collaboration-network-structure-and-team-performance/citation); [preprint PDF (Uzzi site)](https://www.kellogg.northwestern.edu/faculty/uzzi/ftp/guimera_et_al_science_rd_12-17-04.pdf)
- The model shows a phase transition: when p rises above a critical value, a "giant component" of connected practitioners appears. The share of repeat incumbent–incumbent links (fR) is large when both p and q are large. Intermediate fR means a balance between experience and new pairings. — [preprint PDF](https://www.kellogg.northwestern.edu/faculty/uzzi/ftp/guimera_et_al_science_rd_12-17-04.pdf)
- Data: Broadway musicals (playbills 1877–1990, 2,258 productions) and three scientific fields (social psychology, economics, ecology, astronomy were analysed). — [Kellogg Insight](https://insight.kellogg.northwestern.edu/article/teamwork_takes_center_stage); [SEES lab](https://www.seeslab.info/publications/team-assembly-mechanisms-determine-collaboration-network-structure-and-team-performance)
- Core performance result, using journal impact factor as the measure: "p was positively correlated with impact factor, whereas q was negatively correlated with impact factor, for both ecology and social psychology." Successful teams therefore have a higher fraction of incumbents but fewer repeat collaborations, and less diverse teams perform worse. — [preprint PDF](https://www.kellogg.northwestern.edu/faculty/uzzi/ftp/guimera_et_al_science_rd_12-17-04.pdf)
- Teams in high-impact journals form a large giant component, while teams in low-impact journals form small isolated clusters. The authors read this as better sampling of the field's "invisible college." Astronomy showed no correlation. Three of the four fields had similar p, q and S values, which hints at a possible "universal" optimum. — [preprint PDF](https://www.kellogg.northwestern.edu/faculty/uzzi/ftp/guimera_et_al_science_rd_12-17-04.pdf)
- Uzzi & Spiro, "Collaboration and Creativity: The Small World Problem," *American Journal of Sociology* 111(2), 2005. It covers 474 Broadway musicals from 1945–1989 and builds a small-world quotient Q from clustering and path length. Both financial and critical success rise with Q up to a point and then decline (parabolic): high Q brings both cohesion and too much familiarity and conformity. — [Kellogg research page](https://www.kellogg.northwestern.edu/academics-research/research/detail/2005/collaboration-and-creativity-big-differences-from-small-world-networks/); [Kellogg Insight](https://insight.kellogg.northwestern.edu/article/collaboration_and_creativity)
- Caveat: Slate (2012) argues the popular "Goldilocks" reading oversimplifies the study. Q varied over time, peaking in 1947 and passing the "sweet spot" around 1950. — [Slate](https://www.slate.com/articles/life/do_the_math/2012/03/how_creativity_works_what_broadway_musicals_really_teach_us_about_collaboration_.html)

### Inferences
- Possible graph-scoring signals: (1) reward experience, such as people who have already run a venture or project, which corresponds to "incumbent"; (2) penalise recommending pairs who have already worked together, or who sit in the same dense cluster, which corresponds to low q; (3) favour triads that mix one experienced person with one or more newcomers.
- At the platform level, the aim should be one well-connected expat community (a giant component), not isolated diaspora clusters. Recommendations that bridge clusters, for example across nationalities or cities, serve this aim.
- These findings come from creative and scientific teams. Transferring them to cafes or local businesses is plausible but untested.

### Gaps
- Exact numeric optimal p and q values, read off the paper's figures, were not extracted.
- No direct replication on startup founding teams was found in this research pass.

## Q2. Weak ties, moderately weak ties, structural holes and brokerage

### Takeaway
LinkedIn's randomized "People You May Know" (PYMK) experiments give causal evidence that *moderately* weak ties produce the most job mobility, an inverted U in tie strength. Burt shows that people who bridge structural holes have more and better-rated ideas. Together these argue for recommending "friends-of-friends with a few mutual contacts" from different clusters, rather than strangers or close friends.

### Cited Findings
- Rajkumar, Saint-Jacques, Bojinov, Brynjolfsson & Aral, "A causal test of the strength of weak ties," *Science* 377:1304–1310 (Sept 2022). LinkedIn's PYMK algorithm was randomly varied for more than 20M users over 5 years, during which 2B new ties and 600k new jobs were created. — [Stanford Digital Economy Lab](https://digitaleconomy.stanford.edu/publication/a-causal-test-of-the-strength-of-weak-ties); [paper PDF](https://www.Gwern.net/doc/sociology/technology/2022-rajkumar.pdf)
- Tie strength and job transmission follow an inverted U. Moderately weak ties, measured by mutual connections, and the weakest ties, measured by interaction intensity, produced the most job mobility. Weak ties mattered more in digital industries, and strong ties mattered more in less digital industries. — [Stanford Digital Economy Lab](https://digitaleconomy.stanford.edu/publication/a-causal-test-of-the-strength-of-weak-ties); [Science News](https://sciencenews.org/?p=3117214)
- Background: Granovetter, "The Strength of Weak Ties," *Am. J. Sociol.* 78:1360 (1973), is cited as reference 1 in Guimerà et al. — [preprint PDF](https://www.kellogg.northwestern.edu/faculty/uzzi/ftp/guimera_et_al_science_rd_12-17-04.pdf)
- Burt, "Structural Holes and Good Ideas," *AJS* (2004), studied managers at a US electronics company. Compensation, positive evaluations, promotions and good ideas went disproportionately to people whose networks span structural holes. Brokers were more likely to voice ideas, less likely to have them dismissed, and more likely to have them judged valuable. The mechanism: opinion is more homogeneous within groups than between them, so brokers see alternative ways of thinking. — [paper PDF (Stanford CS224W reading)](https://snap.stanford.edu/class/cs224w-readings/Burt04StructureHole.pdf)

### Inferences
- Candidate signal: a tie-strength "sweet spot". Score candidates at 2 hops with a small-to-moderate number of mutual connections highest. Score direct strong ties and 4+ hop strangers lower. This matches the LinkedIn finding, though LinkedIn's outcome was jobs, not co-founding.
- Candidate signal: a brokerage bonus. Give a bonus to users with low constraint or high betweenness, such as expats bridging the host-country and diaspora communities. They may be valuable co-founders, or good connectors to introduce.
- In less digital sectors (cafes, local services), the LinkedIn result suggests strong ties may matter more. The scoring could weight tie strength by venture type.

### Gaps
- No causal study was found on weak ties and *co-founder formation* specifically. The LinkedIn evidence is about job transmission.

## Q3. Algorithms: team formation problem, link prediction, GNNs, cold start, fairness and homophily

### Takeaway
The CS "team formation problem" (Lappas et al. 2009) frames the task as covering required skills while minimising communication cost in a social graph. It is NP-hard, so greedy and approximate methods are used. Newer neural and GNN team recommenders exist, mostly academic. People recommenders that reinforce homophily can reduce minority visibility (the "algorithmic glass ceiling"). Affinity homophily among co-investors measurably reduces venture success.

### Cited Findings
- Lappas, Liu & Terzi, "Finding a team of experts in social networks," KDD 2009, pp. 467–476. Given a task, a pool of people with skills, and a social network capturing compatibility, the goal is to find a subset that covers the skills and works well together, measured by communication cost such as graph diameter or MST cost. Both variants are NP-hard. — [KDD 2009 proceedings (dblp)](https://dblp1.uni-trier.de/db/conf/kdd/kdd2009.html); [Terzi publications](https://cs-people.bu.edu/evimaria/publications.html)
- Neural and GNN team recommendation is an active research line. Examples: LANT (graph attention plus Deep Graph Infomax for team recommendation, Univ. of Windsor 2023 thesis); spatial team formation on a heterogeneous expert–skill–location graph; GNN team-performance prediction (EPJ Data Science 2024). These are theses and single papers, not mature production systems. — [Windsor LANT thesis](https://scholar.uwindsor.ca/etd/9075); [Spatial TF with GNN](https://www.uwindsor.ca/science/computerscience/news/node/245301); [EPJ Data Science 2024](https://epjds.epj.org/articles/epjdata/abs/2024/01/13688_2023_Article_442/13688_2023_Article_442.html)
- Fabbri et al. (ICWSM 2020) studied people recommenders on graphs with a majority and a minority group. Minority visibility depends largely on homophily within each group, and recommenders can amplify or reduce the disparity depending on the data and algorithm. — [paper PDF](https://www.isi.it/wp-content/uploads/2024/01/the-effect-of-homophily-on-disparate-visibility-of-minorities-in-people-recommender-systems_7288-Article%20Text-10518-1-10-20200601.pdf)
- Stoica, Riederer & Chaintreau, "algorithmic glass ceiling" (Instagram data). Common who-to-follow recommenders can worsen under-representation of a group at the top of the degree distribution by reinforcing homophily. — [Cambridge talk abstract](https://talks.cam.ac.uk/talk/index/104377/); [survey: Inequality and inequity in network-based ranking](https://arxiv.org/pdf/2110.00072)
- Gompers, Mukharlyamov & Xuan, "The Cost of Friendship," *JFE* 119(3):626–644 (2016). VCs show strong *detrimental* homophily when choosing co-investors. Affinity-based similarity (shared ethnicity, school, past employer) "dramatically reduce[s] the probability of investment success," while ability-based similarity helps. The effect is strongest at early stage and is attributed to poor decisions after the investment is made. — [NBER w18141](https://www.nber.org/papers/w18141)
- Wasserman (Founder's Dilemmas, Harvard data) reports that more than half of founding teams were formed with people the founders knew socially, not professionally (friends about 43%, plus family). He calls these "the least stable of all the start-up teams," and family teams even more so. — [Stanford eCorner transcript](https://stvp.stanford.edu/wp-content/uploads/sites/3/2024/09/the-founders-dilemmas-entire-talk-transcript.pdf); [entrepreneurship.org video](https://www.entrepreneurship.org/video/relationships)

### Inferences
- A practical architecture for the app:
  - Stage 1: candidate generation via link prediction (common neighbours / Adamic–Adar, plus embeddings) restricted to the tie-strength sweet spot.
  - Stage 2: skill complementarity, scored as coverage of the venture's needed roles (the Lappas framing).
  - Stage 3: compatibility features (commitment, stage, location, values or psych test).
  - Stage 4: re-ranking for diversity and exposure fairness.
- Cold start: new expats have empty graphs. Use profile and questionnaire features plus event or community co-attendance, as YC does (profile-only matching). Add graph signals as edges accumulate.
- Homophily caution: same-nationality matching is an easy default for an expat app. The Gompers and Wasserman evidence suggests affinity-only matches (same diaspora, friends) carry hidden costs. Weight ability and complementarity over affinity, and cap same-origin share in recommendation lists.

### Gaps
- No peer-reviewed survey of GNN team formation (2023–2026) was located. The Univ. of Windsor group (Fani lab) appears active, but the survey was not found.
- No published evaluation of a production co-founder recommender's algorithm (YC, CoFoundersLab) was found. Their ranking methods are not public.

## Q4. Existing platforms and programs: how they work and what outcomes they report (status as of 2026)

### Takeaway
Most matching platforms report activity metrics (profiles, invites, matches), not durable outcomes. YC's 2021 data is the richest public dataset. Talent-investor programs (EF, Antler) form teams through structured in-person "co-founder dating" with deadlines, and accept frequent break-ups as normal. Several consumer networking apps (Bumble Bizz, Lunchclub) are discontinued or dormant.

### Cited Findings
**YC Co-Founder Matching (active, free)**
- Launched publicly July 2021 with 9,000 matches among 4,500 founders in beta. Two companies that met on the platform were accepted into YC S21. Founders are encouraged to run a time-boxed trial project before committing, and YC provides a template agreement. — [YC launch blog](https://www.ycombinator.com/blog/co-founder-matching/); [Freethink](https://www.freethink.com/entrepreneurship-innovation/cofounder-matchmaking)
- Profile fields: technical or not; skills (Product, Design, Engineering, Sales/Marketing, Operations); hours per week (40+ / 20–40 / fewer); location; interests from 18 sectors; full-time/part-time; active vs aspiring; "married to an idea" or open; start timing. Each preference can be marked must-have, flexible, or don't care. — [YC blog Oct 2021](https://www.ycombinator.com/blog/what-do-people-want-in-a-co-founder)
- After 3 months: 16k profiles (40% US, 145 other countries; 42% technical; 13% women). 130k invites sent, 25% accepted, giving 33k matches. 68% of matches were technical + non-technical pairs, 73% idea-holder + idea-open, 55% same country, 61% within 3 time zones. 50% were accepted within 22 hours, and 50% of pairs met within 6.2 days. 79% care about hours commitment, but only 15% treat it as a must-have. 50% don't care about location. Founders open to ideas averaged 5.1 matches, versus 3.6 overall. No outcome data (companies formed or funded) was reported. — [YC blog Oct 2021](https://www.ycombinator.com/blog/what-do-people-want-in-a-co-founder); [TechCrunch](https://techcrunch.com/2021/10/21/what-do-people-want-in-a-co-founder-yc-has-some-answers/)
- A third-party page claims 100k+ matches, but it is unofficial and uncorroborated, so it is discounted. — (see [search note](https://linkedjn.it.com/ycss.html))

**Entrepreneurs First (active; talent investor, "pre-team, pre-idea")**
- Selected individuals form teams during the program. A team-formation deadline applies, and people without a team leave. Sifted describes chaotic "musical chairs" formation, with a Slack channel listing founder "breakups and makeups." — [Sifted](https://sifted.eu/articles/entrepreneur-first-struggles-at-scale); [participant review (Substack)](https://danmacd.substack.com/p/is-entrepreneur-first-worth-it-part-3c4)
- Outcomes: the first cohort of 32 founded 11 companies (2013 interview). More than 600 companies created, worth over $11bn (Wikipedia, 2025). Clifford's site says over $16bn. EF raised $200m at a $1.3bn valuation in 2026. — [80,000 Hours interview 2013](https://80000hours.org/2013/10/interview-with-matt-clifford/); [Wikipedia](https://en.wikipedia.org/wiki/Entrepreneurs_First); [matthewclifford.com](https://www.matthewclifford.com/)

**Antler (active; residency model)**
- Phase 1 runs about 10 weeks: co-founder matching through structured sprints plus idea validation. Several failed pairings are treated as normal. Cohorts are said to be about 60–70 people per location, producing 8–10 companies (third-party). Acceptance is about 3% (third-party). US terms: $250k at a $2.75M post-money valuation (Antler). Antler's US blog cites 137 teams invested out of 700+ founders invited into the US residency. — [Antler US terms blog](https://antler.co/blog/antler-reveals-revamped-us-investment-terms); [Superscout](https://superscout.co/accelerator/antler); [Lynx Collective](https://lynxcollective.substack.com/p/antlers-residency-program-a-unique)

**Others**
- CoFoundersLab: still operating in 2026 with free and paid tiers. It acquired Bizpora earlier. — [GrowthMentor 2026 guide](https://www.growthmentor.com/blog/websites-to-find-a-co-founder); [TechCrunch](https://techcrunch.com/?p=994712)
- StartHawk: reportedly rebranded to FounderCloud. Per a third-party guide it is now as much an ideas board as a matching tool. — [GrowthMentor 2026](https://www.growthmentor.com/blog/websites-to-find-a-co-founder)
- Bumble Bizz: **discontinued**, per Bumble's support page. Bizz profiles were removed. — [Bumble support](https://support.bumble.com/hc/en-us/articles/30208230972189-Availability-of-Bumble-Bizz)
- Lunchclub (AI-matched 1:1 professional meetings): **effectively dormant or defunct**. No official shutdown notice was found, but the last app update was March 2022, and the founders reportedly pivoted to a crypto exchange (Lighter), per secondhand reporting of Fortune, Nov 2025. — [Articuler](https://www.articuler.ai/resources/compare/lunchclub-alternatives/)

**Immigrant-focused**
- Unshackled Ventures (US): a pre-seed fund for immigrant founders with a $35M Fund III (2023). The Eighteen150 founder-in-residence program offers $150k or 18 months of runway plus full immigration/employment support for 10%. U-Labs NYC (Fall 2025) is a cohort program for immigrant founders. — [TechCrunch](https://techcrunch.com/2023/06/27/unshackled-ventures-35m-immigrant-founders/); [Unshackled Substack](https://unshackledvc.substack.com/p/applications-now-open-u-labs-nyc)

### Inferences
- Copyable mechanics: YC's must-have / flexible / don't-care weighting, the active/aspiring and idea-open flags, and a time-boxed trial project after a match. EF/Antler show that density plus a deadline drives team formation, which an app can mimic with time-boxed "venture sprints" or local cohorts.
- No platform publicly reports match → durable venture conversion. The app could measure this itself (match → meeting → trial project → registered venture → alive at 12 months), which would be a differentiator.
- The non-tech venture case (cafes, studios, local services) is largely unserved: all the platforms above are tech- or VC-oriented.

### Gaps
- No EF or Antler published team break-up rate or team-formation rate per cohort was found. The EF "11 companies from 32 people" figure is 2013-only.
- No source was found for meetup-based founder matching outcomes, or for European immigrant-founder programs. Not searched in depth: Migrant Entrepreneurship Hubs, Entrepreneur Visa programs, Startup Germany. Lunchclub's status is not officially confirmed.

## Q5. Does trial collaboration (hackathons, short projects, "co-founder dating") predict lasting teams?

### Takeaway
The evidence is indirect. Large hackathon studies show that a considerable share of projects continue. Long-term continuation is predicted by team skill diversity and an intention to expand the project, not by short-term intensity or winning. Programs (YC, EF, Antler) prescribe trial periods, but none publish validation data.

### Cited Findings
- Nolte, Chounta & Herbsleb (2020), "What Happens to All These Hackathon Projects?" is a large-scale study across many hackathons. A considerable number of projects continue. Short-term continuation is associated with technical preparation, the number of technologies used, and winning. Long-term continuation depends on skill diversity in the team, members' capabilities relative to the tech stack, and an intention to expand reach. Intensive short-term activity is linked to *lower* long-term continuation. — [NSF PAR copy](https://par.nsf.gov/servlets/purl/10284449); [Univ. of Tartu blog](https://blog.cs.ut.ee/?p=1343)
- Corporate hackathon studies (Nolte with Microsoft and CMU co-authors) found that participants expanded their internal networks. Multi-site teams did not affect continuation (Tartu thesis). — [Tartu dspace](https://dspace.ut.ee/items/b83e06fb-b3e1-49c8-8f4e-04251bd15296/full)
- YC advises matched founders to work on a time-boxed trial project before committing. — [YC launch blog](https://www.ycombinator.com/blog/co-founder-matching/)
- Wasserman: trust from the social realm does not reliably carry over to the professional one, and friend teams avoid hard conversations. This argues for structured professional trial work even among acquaintances. — [Stanford eCorner transcript](https://stvp.stanford.edu/wp-content/uploads/sites/3/2024/09/the-founders-dilemmas-entire-talk-transcript.pdf)

### Inferences
- Product mechanic: after a match, offer a structured 2–4-week mini-project with check-ins and explicit expectation-setting (roles, hours, equity). Record continuation as the training label for the recommender.
- Score skill diversity within a proposed team, since Nolte found it predicts long-term continuation. Do not over-reward "chemistry" signals from a single intense event.

### Gaps
- No randomized or longitudinal study was found showing that co-founder trial periods improve team survival.
- No published data was found on hackathon-formed teams becoming registered companies.
