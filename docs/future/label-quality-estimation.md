# Label Quality Estimation

Why needed: the user may want to know the label quality to make the stoppage analysis decision, or decide whether quality assurance is needed

## Setting

- for each data object and label (d, l), a boolean c(d, l) denotes whether the label is correct for the data object
    - example: when the label task is classification, c(d, l) denotes whether classification label l is the same as the ground truth label
    - example: when the label task is segmentation, c(d, l) denotes whether the segmentation label l is "approximately" the ground truth segmentation
    - remark: the judgement of "same/approximately as ground truth" is made by the quality assurance interface user
- the quality of labels in labeled dataset (d1, l1), (d2, l2), ... (dn, ln) can be quantified as q(D, L) where D = (d1, ..., dn), L = (l1, ..., ln)
    - example: when the label task is classification, q denotes the accuracy
    - example: when the label task is segmentation, q denotes the rate of data objects with segmentation of acceptable quality

## Naive Estimation of q

- assume the user randomly examine n data objects' label and regard nc data objects to have acceptable quality
- the goal is to estimate the distribution of q, i.e., the rate of data objects of acceptable quality in the whole dataset
    - remark: given the distribution of q, the system can answer user's question such as "what is the confidence that quality label rate is larger than 90%"

probability density p(q | nc; n) = p(q, nc; n) / p(nc; n) = p(nc | q; n) p(q) / p(nc; n)

where p(nc | q; n) = C(n, nc) q^nc (1-q)*(n-nc)

assume: p(q) = 1, i.e., the prior is that q is uniform on [0, 1]

=> p(nc; n) = 1 / (n+1)

=> p(q | nc; n) = (n+1) C(n, nc) q^nc (1-q)*(n-nc)

### Typescript Implementation

```typescript
// p(q | nc; n) = (n+1) C(n, nc) q^nc (1-q)*(n-nc)
const f = (n: number, nc: number, q: number): number => {
  let logp: number = 0;
  for (let i = 1; i <= n + 1; i += 1) logp += Math.log2(i);
  for (let i = 1; i <= n - nc; i += 1) logp -= Math.log2(i);
  for (let i = 1; i <= nc; i += 1) logp -= Math.log2(i);
  logp += nc * Math.log2(q);
  logp += (n - nc) * Math.log2(1 - q);
  return 2 ** logp;
};
```
