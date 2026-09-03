# Bayesian Foundations

__[Gelman & Shalizi (2013)](https://www.alphaxiv.org/pdf/1006.3868)__
* Kuhn vs Popper

__[Box (1980)](https://watermark02.silverchair.com/jrsssa_143_4_383.pdf?token=AQECAHi208BE49Ooan9kkhW_Ercy7Dm3ZL_9Cf3qfKAc485ysgAAAmcwggJjBgkqhkiG9w0BBwagggJUMIICUAIBADCCAkkGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM4rsLyIIdV0kNjE23AgEQgIICGj3MjKJr7ofDpmYI9lcdk3-PdcKlYCeCwzHp0RKh5PZmoNTsC0y_eq3Om-SUZzyZkM-cyg-FvhAoIg7tKNFFbsLVkLrAsthdFpw1Tr1uRIdl_1lt1v-6PFa-HLRbFO-3i7xZGYd0GI5750-QzNzgGd7B4Em8-W0x-Mvi0T7t4EN7spZtwsFp77wsuuRBUA-m3TZsOYzr5DwlZRvLnj2Ucn3EScrZgp-huExzzWI-lvPHL0JqJCwDNLZBXsHaZGLNwvAaQULOYOy81qBhu-zSGO_Ztk9pHqltYPhUX6qTNhFlUmkaTJHa1ymyGQoclpeNdE1BBwv1OJTRtVETI4xY3eHVBqJ0NztfKKcOBatIJ-ZCjxiz5U3BPOsbxzo6THBpLHt4jm8kCMw5HBZQNAPDJGnMLqvsyvYy-BnQHWYdaDz1GPavo_SFrMYDWRavhY0uXqx38qvqjcPHk7KgiqepamdH0mSN3b3LjibPilEbDQJ46SUAV_KZDpKyFqbbev48Ztgue2u3XxBlcOkHE1EUHUlhwucBiQxQZu8liElsj0cXa5ofJ6_vbPSwVBBuwifmiRc2qdLQC7_49RJKpHZhObgmon1jYoY63HjvXf7aPQnPhpgBGq5UNPHJSWt8TaS3mDzbm65WzTYbMzjKuqKave2n-lTz99YK9i35LlfSV8SlnmN-vdWoT2JzZNKPHLlxsbVeornGFOBujXE)__^[I also found the [discussion](https://rss.onlinelibrary.wiley.com/doi/epdf/10.1111/j.2397-2327.1980.tb04199.x) of his paper to be quite interesting. One of the points is about Box's emphasis on looking for "robust samples" rather than "robust procedures" and how non-robust samples have an effect on the inference drawn upon it.]

"No statistical model can safely be assumed adequate". 

There is a constant interplay between induction and deduction in building statistical models. Observed data is used to suggest a tentative model (induction), and this results in acquiring more data, analyzing it, and then making updates to the model (deduction). In this way, the model is constantly evolving. 

Criticism induces model modification, where it looks at model $M_i$ with data $y$ and asks if $M_i$ is consistent with $y$ by looking at tests like goodness of fit. Then, a new model $M_(i +1)$ is proposed and is checked against $y$ and new data $D_(j+1)$ to explore regions of poor fit from the previous model. 

Estimation is inferencing the model with its current parameters. It is used throughout the model building process because to conduct criticism of a model, we need to estimate the parameters at intermediate stages.

Box argues that prior belief is not a feature of Bayesian inference, rather it is an assumption made across all scientific inference. In its simplest form, the model itself is a prior in that "it is a probability statement of all the assumptions currently to be tentatively entertained _a priori_". 

Let $y$ be a random variable representing potential data, $theta$ represent parameters of the model, and $A$ represent the assumptions in the model specification. 

$$p(y,theta|A) &= p(y|theta,A) p(theta|A) \
&= p(theta|y,A)p(y|A)$$
We are also able to compute the predictive distribution before any data becomes available:
$$
p(y|A) = integral_theta p(y|theta,A)p(theta|A)d theta
$$
When actual data $y_d$ becomes available, we can compute 
$$p(y_d,theta|A) = p(theta|y_d,A)p(y_d|A)$$
The first factor is the posterior distribution:
$$p(theta|y_d,A) prop p(y_d|theta,A)p(theta|A)$$
The second factor is the predictive density associated with the obtained $y_d$:
$$p(y_d|A) = integral_theta p(y_d|theta,A)p(theta|A) d theta$$

We can compute the prior predictive p-value for model checking:
$$alpha = text(Pr) {p(y|A)<p(y_d|A)}$$
Conditioned on the assumptions for the current model, $alpha$ represents the probability of generating a dataset $y$ that is more unlikely than the one we observed $y_d$ by comparing the predictive densities. If $alpha$ is very small, then $y_d$ falls at the edge of what the model expects, so the model is a poor fit for reality.

"While the posterior distribution combines information from data
and prior in a manner which is entirely appropriate if the model is to be believed, the predictive distribution contrasts these two sources of information and checks their compatibility."

__[Robert & Casella (2011)](https://projecteuclid.org/journalArticle/Download?urlId=10.1214%2F10-STS351)__

Monte Carlo methods were born in Los Alamos from physicists working on the atomic bomb during World War II.

Monte Carlo methods have the general form of:
1. Define domain of possible inputs
2. Generate inputs randomly from a probability distribution over the domain
3. Perform a deterministic computation of the outputs
4. Aggregate the results
MC methods typically require lots of data.

__[Metropolis et al. (1953)](https://www.scribd.com/document/732813572/metropolis-et-al-1953)__

Their primary focus was to compute the properties of any substance that is composed of interacting individual molecules^[$E(theta)$ represents the potential energy of the system given the positions of the particles. $exp E(theta) / ( k T)$ is the Boltzmann distribution that gives the probability a system will be in a certain state as a function of the energy and temperature.]:
$$
overline(F) = (integral F(theta) exp (-E(theta) / (k T) ) d theta) / ( integral exp (-E(theta)/ (k T)) d theta )
$$

The naive implementation of MC for estimating this quantity would be to:
1. Randomly place $N$ particles
2. Calculate the energy and weight the configuration with $exp (-E(theta) / ( k T ))$

However, this is not practical because there is high probability that configurations are chosen where $exp (-E(theta) / ( k T ))$ is very small, so it's a configuration with low weight. They propose a random walk modification to naive MC:
1. For each particle $i in [1, N]$, we create a proposal configuration 
$$x_i^' = x_i + sigma xi_(1 i) "and" y_i^' = y_i + sigma xi_(2 i)\ 
xi_(1 i), xi_(2 i) ~ cal(U)(-1, 1)$$

2. Calculate the energy and accept the proposal with probability $min (1,  exp (-E(theta) / ( k T )))$

3. Compute the average, where $F_j$ is the value $F$ after the $j^"th"$ move 
$$overline(F) = 1/M sum_(j = 1)^M F_j$$

Because each particle can move to any point with finite probability, each possible configuration is possible, proving irreducibility^[Irreducibility is the property of being able to transition between any two states in the system with non-zero, positive probability]. 

Assume we have a large ensemble of systems, where $v_r$ is the number of systems at state $r$, referring to a particular configuration. Let $P_(r s)$ be the a priori probability that the move carries the system from state $r$ to $s$, and we note that $P_(r s) = P_(s r)$. The net number of systems moving from s to r is $P_(s r)(v_s exp (-(E_r - E_s) / (k T)) - v_r)$. Without loss of generality, if $v_r / v_s > exp(-E_r/(k T)) / exp(-E_s / (k T))$, then  on average, more systems move from state $r$ to state $s$. This proves the system approaches a stationary distribution. If a Markov chain is irreducible, the existence of a stationary distribution implies the chain is positive recurrent.

The Ergodic Theorem states that for a well-behaved (irreducible and positive recurrent^[The probability of returning to any starting state is 1, and the expected time it takes to return to that state is finite.]), the time average of a simulated process will eventually equal its sample average: 
$$
lim_(n arrow infinity) 1/n sum_(k=0)^(n-1) f(X_k) = sum_i f(i) pi(i)
$$

Because we've shown the system is irreducible and positive recurrent, we can assume ergodicity.

__[Hastings (1970)](https://www.dpye.iimas.unam.mx/soriano/BAYES/DOCUMENTOS/NOTAS/HASTINGS.pdf)__

MC methods require sampling from high-dimensional probability distributions, which may be difficult and computationally expensive. 

Some methods to sample from such distributions are:

1. If possible, factorizing the distribution into the product of "easier" one-dimensional distributions from which samples can be obtained

2. Use importance sampling. Consider PDF $p(x)$ that is difficult to sample from^[Computers natively generate uniform random numbers $cal(U)(0, 1)$, so we use inverse transform sampling to sample from complex distributions. This requires computing the inverse of the desired CDF, which is often analytically impossible.]. MC algorithm would require us to obtain $x_i ~ p(x)$ and estimate $hat(J)_1 = 1/N sum_i f(x_i)$. Instead, we sample from an easier distribution $q(x)$^[Derivation:
$J &= E_p [f(x)] \ &= integral f(x) p(x) \ &= integral f(x) p(x) q(x) / q(x) &= E_q [f(x) p(x) / q(x)]]$
]. So we can compute $hat(J)_2 = 1/N sum_i f(x_i)p(x_i)/q(x_i)$. However, the values of the weights $w(x_i) = p(x_i) / q(x_i)$ for reasonable values of $N$ may all be extremely small or few be extremely large. 

