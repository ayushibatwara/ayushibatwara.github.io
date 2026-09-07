# Geometry of Variational Methods


"We wish to obtain upper or lower bounds on a function of interest" (Jordan et al., 1999). 

## Convex conjugates

A function $f$ is convex if and only if $f''(x) >= 0$. We define the convex conjugate (Fenchel conjugate) for $f$ as^[The supremum is the least upper bound of the function.]:
$$
f^*(y) &= sup_(x) (y^T x - f(x)) \
f(x) &= sup_(y) (y^T x - f^*(x))
$$

Let's say we're interested in finding the convex conjugate for $f(x) = x^2$. Intuitively, the convex conjugate is saying that for every possible slope $y$, we want to find the y-intercept that corresponds to the lower bound of the function for that particular $y$. In this way, our function $f(x)$ is now defined by its affine minorants^[An affine function $h(x) = a x + b$ is a minorant if $h(x) <= f(x)$ for all $x in "dom"(f)$.].

```typst
#import "@preview/lilaq:0.4.0" as lq
#let xs = lq.linspace(-2.6, 4.6, num: 200)
#lq.diagram(
  width: 330pt, height: 220pt, xlim: (-2.6, 4.6), ylim: (-2.6, 4),
  xlabel: $x$, grid: (stroke: 0.5pt + luma(229)),
  // one tangent line per slope y: the affine map x -> y x - f*(y), f*(y) = y^2/4
  ..(-3, -2, -1, 0, 1, 2, 3).map(y =>
    lq.plot(xs, xs.map(x => y*x - y*y/4), mark: none, stroke: 0.6pt, color: gray)
  ),
  lq.plot(xs, xs.map(x => x * x), mark: none, color: red, stroke: 1.4pt),
)
```
The slope of the tangent line is $f'(x)$, so to find the y-intercept, we solve $f(x) = f'(x) * x + b$ to get $b = f(x) + f'(x) * x$. By convention^[Unfortunately, I've only seen solving for the negative y-intercept in the literature.], we find the negative y-intercept with the convex conjugate: $- b = f'(x)*x - f(x) = f^*(f'(x))$. Instead of defining the function as $(x, y)$ pairs, we can now define it as $(m, b)$ pairs, where $m$ is the slope and $b$ is the y-intercept. 


Concretely, say our convex function is $f(x) = x^2$. Our convex conjugate is $f^*(y) = sup_(x in "dom"(f)) y x - x^2$. If we set $y = 3$, we are trying to find the supremum w.r.t. $x$ of $3x - x^2$, which is also equivalent to finding the maximum^[This is because the $3x-x^2$ is in the closed interval.]. 

To find the maximum, we can compute the derivative and set it equal to 0 to get $x = 1.5$^[$$
d/ (d x) (3x - x^2) &= 0 \ 3 - 2x &= 0 \
2x &= 3 \
x &= 1.5 
$$
]. Finally, we can evaluate the convex conjugate to get $f^*(3) = 2.25$^[$$
f^*(3) = 3 * 1.5 - 1.5^2
$$]. Therefore, the tangent line is $y = 3x - 2.25$.

More generally, we can find $$
f^* (y) &= max_x ( y x - x^2) \ 
&= y * y/2 - (y/2)^2 
&= y^2 / 4
$$

```typst
#import "@preview/lilaq:0.4.0" as lq
#let xs = lq.linspace(-2.6, 4.6, num: 200)
#lq.diagram(
  width: 330pt, height: 220pt, xlim: (-2.6, 4.6), ylim: (-2.6, 4),
  xlabel: $x$, legend: (position: bottom + right),
  grid: (stroke: 0.5pt + luma(229)),
  lq.plot(xs, xs.map(x => x * x), mark: none, color: red, stroke: 1.2pt, label: $f(x) = x^2$),
  lq.plot(xs, xs.map(x => 3*x - x*x), mark: none, color: blue, stroke: 1.2pt, label: $y x - f(x)$),
  lq.plot(xs, xs.map(x => 3*x - 2.25), mark: none, color: green, stroke: 1.2pt, label: [tangent, slope $y$]),
  lq.scatter((1.5,), (2.25,), color: black),
  lq.scatter((0,), (-2.25,), color: black),
)
```

## Conjugates as bounds

The definition of the convex conjugate yields one of the most useful bounds in optimization. Consider the logistic function:
```typst
#import "@preview/lilaq:0.4.0" as lq
#let xs = lq.linspace(-3.4, 3.4, num: 150)
#lq.diagram(
  width: 330pt, height: 220pt, xlim: (-3.4, 3.4), ylim: (-0.2, 1.8),
  xlabel: $x$, ylabel: $sigma(x)$, grid: (stroke: 0.5pt + luma(229)),
  lq.plot(xs, xs.map(x => 1 / (1 + calc.exp(-x))), mark: none, color: red, stroke: 1.2pt,
    label: $sigma(x) = 1 / (1 + e^(-x))$),
  lq.plot((-3.4, 3.4), (0.5, 0.5), mark: none, stroke: (paint: gray, thickness: 0.6pt, dash: "dashed")),
  lq.plot((-3.4, 3.4), (1, 1), mark: none, stroke: (paint: gray, thickness: 0.6pt, dash: "dashed")),
)
```

The logistic function itself is neither convex nor concave, but we'd still like to take advantage of the bounds we can find via convex conjugates. Conveniently, the logistic function is log concave^[It's concave after you take the log of it. Proof:
$$
g''(x) &= d/ (d x) (d / (d x) (-ln ( 1 + e ^(-x)))) \ 
&= d/ (d x) (e^(-x) / (1 + e^(-x))) \
&= -e^(-x) / (1 + e^(-x))^2 \
&<= 0
$$
].

Let's now find the concave conjugate for $g(x)$

$$
g(x) = ln(1 / (1 + e^(-x))) = -ln (1 + e^(-x))
$$
Plugging in the formula for concave conjugate^[
Our goal is to find the minimum:
$$
d/ (d x)(y x + ln(1 + e^(-x))) &= 0 \ 
y - e^(- x) / (1 + e^ ( -x )) & = 0 \ 
y &= e^(- x) / ( 1 + e^(- x)) \ 
y & = 1 / (e^x + 1) \ 
e^x+ 1 &= 1 / y \ 
e^x &= 1 / y - 1 \
x &= ln(1 / y - 1) \ 
x^* &= ln ( (1 - y ) / y)
&
$$ 
Then, plugging this into the formula:
$$
g(y) &= y x^* + ln(1 + e^(-x^*)) \ 
&= y (ln (1 -y) - ln(y))- ln(1 - y) \
&= -y ln y - (1- y) log (1 - y) \ 
&= H(y) arrow "binary entropy function"
$$
]:
$$g^*(y) &= inf_x { y x - g(x) } \ 
&= H(y)
$$

Rewriting in terms of $g(x)$, we find:
$$
g(x) = inf_y {y x - H(y)}
$$

If we take the exponential of both sides, we get:
$$
e^(g(x)) &= inf_y {e^(y x - H(y)) }\ 
sigma(x) &= inf_y {e^(y x - H(y))} \ 
sigma(x) &<= e^(y x - H(y))
$$

In the concave case, the concave conjugate gives us a family of upper bounds. Because the conjugate takes an infimum, any choice of $y$ provides an upper bound, while optimizing over $y$ gives the tightest upper bound. This is the concave analogue of the Fenchel inequality.

```typst
#import "@preview/lilaq:0.4.0" as lq
#let xs = lq.linspace(-3.3, 3.3, num: 200)
#let H(e) = -e * calc.ln(e) - (1 - e) * calc.ln(1 - e)
#lq.diagram(
  width: 330pt, height: 220pt, xlim: (-3.4, 3.4), ylim: (-0.2, 1.8),
  xlabel: $x$, legend: (position: top + left),
  grid: (stroke: 0.5pt + luma(229)),
  ..(0.2, 0.4, 0.6, 0.8).map(e =>
    lq.plot(xs, xs.map(x => calc.exp(e * x - H(e))), mark: none,
      stroke: (paint: gray, thickness: 0.7pt))
  ),
  lq.plot(xs, xs.map(x => 1 / (1 + calc.exp(-x))), mark: none, color: red, stroke: 1.3pt,
    label: $sigma(x)$),
  lq.plot((), (), mark: none, stroke: (paint: gray),
    label: $e^(y x - H(y))$),
)
```

Conjugates give us an interesting tool to find affine bounds for our functions of interest. Like we showed above, we have the flexibility to use more general bounds by transforming the argument of the function of interest rather than the value of the function. 


## Bayesian networks as graphical models


