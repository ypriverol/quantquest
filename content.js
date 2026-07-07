export const TOPICS = {
  'scan-levels':  { label:'Scan levels',     review:'MS1=survey, MS2=fragments, MS3=cleaner reporters; ID is MS2, quant varies.' },
  'feature':      { label:'Features',        review:'A feature = isotopes × charge × elution; precursor intensity = XIC area.' },
  'acquisition':  { label:'DDA vs DIA',      review:'DDA picks top-N precursors; DIA fragments everything in wide windows.' },
  'methods':      { label:'Quant methods',   review:'LFQ/SILAC read MS1; DIA reads MS2 fragments; TMT reads reporter ions.' },
  'mbr':          { label:'Match btwn runs', review:'MBR transfers IDs via aligned RT+m/z; same mass+wrong RT = false transfer.' },
  'normalization':{ label:'Normalization',   review:'Removes technical shifts in log2; assumes most proteins do not change.' },
  'rollup':       { label:'Protein roll-up', review:'Many peptides → one protein value; shared peptides → protein groups.' },
  'missing':      { label:'Missing values',  review:'MNAR (low) vs MCAR (random); constant-low imputation fakes on/off hits.' },
  'identification':{ label:'Peptide ID (MS2)', review:'A peptide is identified when its b/y fragment ions explain the MS2 spectrum.' },
};

export const trainingCards = [
  { id:'c1', topic:'scan-levels', front:'What is an MS1 scan?', back:'A survey of the whole, intact peptides (precursors) — gives m/z + intensity.' },
  { id:'c2', topic:'scan-levels', front:'Where does peptide IDENTITY come from?', back:'MS2 fragments (b/y ions) — MS1 alone gives only mass+charge.' },
  { id:'c3', topic:'feature', front:'What is used as a peptide’s quant value?', back:'The integrated AREA of its feature across the elution (usually summed over isotopes) — not a single scan. Beware "peak intensity": it can mean either one scan’s height or the whole feature.' },
  { id:'c4', topic:'feature', front:'Why does one peptide make several peaks?', back:'Carbon-13 isotopes → an envelope; the monoisotopic (lightest) peak is the reference.' },
  { id:'c5', topic:'acquisition', front:'DDA vs DIA in one line?', back:'DDA fragments the top-N precursors; DIA fragments EVERYTHING in wide m/z windows.' },
  { id:'c6', topic:'methods', front:'Where is TMT quantity read?', back:'Reporter ions in MS2 (or MS3) — one reporter per sample.' },
  { id:'c7', topic:'mbr', front:'What is match-between-runs?', back:'Transferring an MS2-derived ID to a run lacking its own MS2, via aligned RT + accurate m/z.' },
  { id:'c8', topic:'normalization', front:'What assumption does normalization make?', back:'That MOST proteins do not change — false for IP/secretome/huge perturbations.' },
  { id:'c9', topic:'rollup', front:'Why "protein groups"?', back:"Peptides shared by several proteins can't tell them apart → reported as one group." },
  { id:'c10', topic:'missing', front:'Why is imputation dangerous?', back:'Filling every gap with a low constant makes on/off proteins look hugely (falsely) significant.' },
  { id:'c11', topic:'identification', front:'What are b and y ions?', back:'Fragments from breaking the peptide backbone in MS2 — b = N-terminal, y = C-terminal; together they spell the sequence.' },
  { id:'c12', topic:'identification', front:'When is a peptide truly identified?', back:'When its b/y fragment ions in MS2 match a database peptide under FDR control — precursor mass alone is not enough.' },
  { id:'c13', topic:'rollup', front:'What do Top3 and iBAQ do?', back:'Roll peptides up to a protein value: Top3 averages the 3 most intense peptides; iBAQ divides summed intensity by the number of observable tryptic peptides (size-corrects).' },
];

export const mcqPool = [
  { id:'q1', topic:'scan-levels', q:'A peptide’s sequence is recognized from…', choices:['The MS1 precursor mass','The MS2 fragment ions','The LC column','Reporter ions'], answer:1, trap:0, explain:'The MS2 fragment pattern is matched to a peptide (database search) — MS1 gives only mass + charge. We say the sequence is "recognized/identified", not literally "read off", because it is a match, not de-novo reading.' },
  { id:'q2', topic:'scan-levels', q:'TMT reporter-ion quantity can be read at…', choices:['MS1 only','MS2 or MS3','The LC column','MS1 or MS2'], answer:1, explain:'Reporter ions appear in MS2, or MS3 with SPS-MS3 for cleaner ratios.' },
  { id:'q3', topic:'feature', q:'For label-free quant, a peptide’s abundance is usually taken as…', choices:['The height of a single MS1 scan','The integrated area of its elution profile (XIC)','The number of MS2 scans','Its charge state'], answer:1, trap:0, explain:'Quant integrates the signal across the elution (XIC area) and typically sums the isotope peaks — not a single-scan height. "Peak intensity" is ambiguous (it can mean either the one-scan height OR the whole feature), so we avoid that term here.' },
  { id:'q4', topic:'feature', q:'Peak spacing of 0.5 m/z in an isotope envelope means charge…', choices:['1+','2+','3+','4+'], answer:1, explain:'Spacing = 1/z, so 0.5 → z = 2.' },
  { id:'q5', topic:'acquisition', q:'DIA differs from DDA because it…', choices:['Fragments only the top-N most intense precursors','Fragments everything in wide m/z windows','Reads quantity from TMT reporter ions','Skips the MS1 survey scan'], answer:1, explain:'DDA picks top-N precursors; DIA co-fragments all precursors in wide windows, so quant uses the (specific) fragment ions.' },
  { id:'q6', topic:'methods', q:'Label-free (LFQ) reads quantity from…', choices:['MS2 reporter ions','MS1 precursor intensity','MS3','The database'], answer:1, explain:'LFQ quantifies the MS1 precursor feature across runs.' },
  { id:'q7', topic:'methods', q:'Which design typically suffers the MOST missing values across samples?', choices:['DDA label-free (each sample a separate run)','TMT (pooled, isobaric)','DIA (wide-window)','SILAC (metabolic pairs)'], answer:0, explain:'Stochastic top-N selection plus cross-run matching makes DDA label-free the most missing-value-prone. TMT (all samples in one run) and DIA (deterministic fragmentation) each reduce missingness by different mechanisms — we are NOT ranking those two against each other, and neither is guaranteed complete (TMT can still have missing reporter ions).' },
  { id:'q8', topic:'mbr', q:"A Run-2 signal has P2's m/z but RT off by +3.5 min (drift is ~+1). You should…", choices:["Transfer P2's ID",'Not transfer — likely a different peptide','Delete P2','Always trust same m/z'], answer:1, trap:0, explain:'Same mass + wrong RT = a false transfer; MBR needs consistent RT.' },
  { id:'q9', topic:'normalization', q:'Global normalization can LIE when…', choices:['Samples are identical','Most proteins really change (e.g. IP)','You use log2','You have replicates'], answer:1, explain:'It assumes most proteins are unchanged; IP/secretome break that.' },
  { id:'q10', topic:'rollup', q:'A row in a protein table is best described as…', choices:['Exactly one gene','A protein GROUP of indistinguishable proteins','A single peptide','A raw scan'], answer:1, trap:0, explain:'Shared peptides force indistinguishable proteins into one group.' },
  { id:'q11', topic:'missing', q:'Missing-not-at-random (MNAR) values are usually…', choices:['Random dropouts','Genuinely low / below detection','Duplicates','Calibration errors'], answer:1, explain:'MNAR gaps track abundance — the peptide is truly low.' },
  { id:'q12', topic:'missing', q:'Filling all gaps with the same low value tends to…', choices:['Fix everything','Manufacture fake on/off hits','Remove batch effects','Improve identity'], answer:1, trap:0, explain:'Constant-low imputation invents huge fold-changes.' },
  { id:'q13', topic:'feature', q:'The SAME peptide can appear as several distinct FEATURES (different m/z) because of…', choices:['Its different charge states (2+, 3+ …)','Its carbon-13 isotope peaks','Its b and y fragment ions','Different search databases'], answer:0, trap:1, explain:'Different charge states place the same peptide at different m/z → separate features. Isotope peaks are NOT separate features — they sit WITHIN one feature\'s envelope (a common mix-up).' },
  { id:'q14', topic:'scan-levels', q:'In DDA, after an MS1 survey the instrument…', choices:['Fragments all ions','Picks a subset (top-N) to fragment','Stops','Skips MS2'], answer:1, explain:'DDA selects the most intense precursors for MS2.' },
  { id:'q15', topic:'methods', q:'iBAQ divides summed intensity by…', choices:['Sample count','Number of observable tryptic peptides','Charge','Retention time'], answer:1, explain:'Dividing by observable peptides removes the protein-size bias.' },
  { id:'q16', topic:'normalization', q:'We work in log2 mainly because…', choices:['It looks nicer','Intensities span orders of magnitude; ratios become differences','It removes IDs','It adds charge'], answer:1, explain:'Log2 compresses dynamic range and turns fold-changes into differences.' },
  { id:'q17', topic:'acquisition', q:'DIA typically quantifies on…', choices:['The MS1 precursor only','Fragment-ion (MS2) chromatograms','TMT reporter ions','Spectral counts'], answer:1, explain:'Wide windows co-isolate many precursors, so DIA quantifies on fragment-ion XICs, which are specific enough to separate them.' },
  { id:'q18', topic:'mbr', q:'The upside of match-between-runs is…', choices:['Fewer missing values','It removes the need for FDR control','Faster LC gradients','Higher precursor charge'], answer:0, trap:1, explain:'MBR fills missing-value holes across runs — but it transfers IDs by RT+m/z, so it adds its own error risk and still needs error control.' },
  { id:'q19', topic:'identification', q:'A peptide is identified when…', choices:['its precursor mass alone matches','its b/y fragment ions explain the MS2 spectrum','it elutes first','it carries charge 2+'], answer:1, trap:0, explain:'Sequence is confirmed by matching the b/y fragment ladder in MS2, not mass alone.' },
  { id:'q20', topic:'identification', q:'b and y ions are…', choices:['random noise','fragments from breaking the peptide backbone','reporter ions','carbon isotopes'], answer:1, explain:'Fragmenting the backbone yields N-terminal (b) and C-terminal (y) ions.' },
  // ── slide-anchored gap-fillers ──
  { id:'q21', topic:'methods', q:'In TMT, a co-isolated background peptide makes the measured reporter ratio look…', choices:['More extreme','Closer to 1:1 (compressed)','Undetectable','Higher in charge'], answer:1, trap:0, explain:'Co-isolation adds background to every channel, pulling ratios toward 1:1 — "ratio compression", the reason SPS-MS3 exists.' },
  { id:'q22', topic:'feature', q:'We use the monoisotopic (left-most) peak as the reference — not the tallest — because…', choices:['It is always the brightest','It is a defined, reproducible mass (all light isotopes)','It has no charge','It elutes first'], answer:1, explain:'The monoisotopic peak (all ¹²C/¹⁴N) is one well-defined mass, so it is a stable reference; which isotope peak is tallest shifts with peptide size.' },
  { id:'q23', topic:'methods', q:'TMT tags are "isobaric", which means the labelled peptides…', choices:['Have the same sequence','Share one precursor mass, split only by MS2 reporters','Share the same retention time','Carry the same charge'], answer:1, explain:'Isobaric = equal total mass: channels overlap in MS1 and separate only via their reporter ions in MS2.' },
  { id:'q24', topic:'normalization', q:'Samples cluster by processing DAY rather than by treatment. That is…', choices:['Real biology','A batch effect','A charge artefact','Good QC'], answer:1, trap:0, explain:'Clustering by run/day is a technical batch effect — account for it in normalization/modelling; do not read it as biology.' },
  { id:'q25', topic:'missing', q:'Which missing value is genuinely MCAR (random) rather than MNAR?', choices:['A low-abundance peptide below the detection limit','A peptide skipped by DDA top-N selection','A whole run lost to a random prep/instrument failure','A peptide that ionizes poorly'], answer:2, explain:'Only the random run/prep failure is abundance-INDEPENDENT (MCAR). The others are all intensity-driven — including DDA under-sampling, which preferentially misses LOW-abundance precursors — so they are MNAR. In proteomics MNAR dominates; true MCAR is rare.' },
  { id:'q26', topic:'acquisition', q:'A library-free (in-silico) DIA search builds its spectral library from…', choices:['The raw file alone','A FASTA + deep-learning predictors of RT & fragments','TMT reporter ions','The LC gradient'], answer:1, explain:'In-silico libraries predict retention time and fragment spectra from the FASTA using ML (e.g. DIA-NN, Prosit) — no prior DDA run needed.' },
  // ── contributed questions, mapped to slide coverage ──
  { id:'q27', topic:'methods', q:'Two peptides at the SAME concentration can give different MS intensities because…', choices:['Signal depends only on molecular weight','They have different response factors (ionization/transmission/detection)','Ion suppression hits all analytes equally','The detector re-calibrates gain per peptide'], answer:1, trap:0, explain:'Each peptide has its own response factor, so raw intensities of DIFFERENT peptides are not comparable — we compare the SAME peptide across samples.' },
  { id:'q28', topic:'methods', q:'Comparing the SAME peptide (same charge) across two samples is valid because…', choices:['It only makes b-ions','Its response factor is identical in both runs and cancels in the ratio','The instrument auto-normalizes every run','Intensity depends only on concentration'], answer:1, explain:'The response factor is the same in both measurements, so it cancels in the intensity ratio — relative quant of one peptide is valid even though cross-peptide abundance is not.' },
  { id:'q29', topic:'methods', q:'In SILAC, heavy and light peptide forms are quantified from…', choices:['Reporter ions in MS2','Pairs of isotope envelopes in MS1','Decoy peptide pairs','Spectral counts'], answer:1, explain:'Light/heavy SILAC partners appear as precursor isotope envelopes in MS1; their intensity ratio gives the quantity.' },
  { id:'q30', topic:'methods', q:"In TMT, each sample's quantity is read from…", choices:['Reporter ions in the low-m/z region of MS2','A reporter region in MS1','Isotope spacing in MS1','The number of MS2 scans'], answer:0, trap:1, explain:'Isobaric TMT peptides share one precursor mass; per-sample reporter ions sit in the low-m/z region of MS2 (or MS3 with SPS-MS3).' },
  { id:'q31', topic:'acquisition', q:'In targeted MRM/SRM, the instrument is given…', choices:['Whatever precursors are most intense each scan','A list of precursor→product ion pairs (transitions)','A list of decoy sequences','Every possible amino-acid permutation'], answer:1, trap:0, explain:'MRM/SRM monitors predefined precursor→fragment transitions for chosen proteotypic peptides — not data-dependent selection.' },
  { id:'q32', topic:'identification', q:'In CID/HCD, the dominant peptide fragment-ion series are…', choices:['a- and x-ions','b- and y-ions','c- and z-ions','immonium ions'], answer:1, explain:'CID/HCD cleave the backbone amide bond → mainly b (N-terminal) and y (C-terminal) ions; c/z dominate in ETD.' },
];

export function validateContent() {
  const errs = [];
  const IDS = Object.keys(TOPICS);
  for (const id of IDS) if (!TOPICS[id].review) errs.push(`topic ${id} missing review`);
  for (const c of trainingCards) {
    if (!IDS.includes(c.topic)) errs.push(`card ${c.id} bad topic ${c.topic}`);
    if (!c.front || !c.back) errs.push(`card ${c.id} missing front/back`);
  }
  for (const q of mcqPool) {
    if (!IDS.includes(q.topic)) errs.push(`mcq ${q.id} bad topic ${q.topic}`);
    if (!Array.isArray(q.choices) || q.choices.length < 2) errs.push(`mcq ${q.id} needs >=2 choices`);
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.choices.length) errs.push(`mcq ${q.id} bad answer index`);
    if (q.trap !== undefined && (q.trap < 0 || q.trap >= q.choices.length)) errs.push(`mcq ${q.id} bad trap index`);
    if (!q.explain) errs.push(`mcq ${q.id} missing explain`);
  }
  return errs;
}
