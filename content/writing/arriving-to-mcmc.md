# Arriving to MCMC

### Priming on Markov Chains^[I'm omitting the proofs since the point of this primer is to refresh definitions and theorems.]

__Markov chain__:
A stochastic process ${X_t: t gt.eq 0}$ is a Markov chain if $P(X_(t+1) = x_(t+1) | X_0 = x_0, ..., X_t = x_t) = P(X_(t+1) = x_(t+1) | X_t = x_t)$ 
for all $t gt.eq 0$ and states $x_0, ..., x_(n+1)$. 

__Hitting time__: The hitting time $T_i^j$ is a random variable that describes the number of steps it takes to hit state $j$ after starting from state $i$: $ T_i^j = inf {n > 0: X_n = j "given" X_0 = i} $

__Irreducible__: a set of C states is irreducible if  all states in the set can communicate with each other, where $ p_(i j)^((n)) > 0$ for some $n gt.eq 0$ and all $i, j in C$. The Markov chain itself is irreducible if the set of all states is irreducible. 

__Recurrent__: A state of a Markov chain is called recurrent if $P[X_n = i "for some" n gt.eq 1 | X_0 = i] = 1$. A Markov chain that is currently in some recurrent state is certain to return to that state again in the future. States that are not recurrent are transient.

An irreducible Markov chain is recurrent if it contains at least one recurrent state.

__Mean recurrence time__: The mean recurrence time is the average time it takes for the Markov chain currently in state $i$ to return to $i$:
$$
mu_i = cases(
  sum_(n >= 1) n f_(i i)^((n))  & "if state" i "is recurrent,", \
  infinity & "if state" i "transient."
) $$
where $f_(i i)^((n))$ is the probability that the Markov chain moves from state $i$ to state $i$ in exactly $n$ steps.

__Positive-recurrent__: A state $i$ is positive recurrent if $mu_i < infinity$. 

An irreducible Markov chain is positive-recurrent if it contains at least one positive-recurrent state.

An irreducible Markov chain with a finite number of states is positive-recurrent.

__Period__: The period of state $i$ is $d_i = gcd(a_1, a_2, a_3, ...)$ where $a_1$ is the time step at which the Markov chain visits state $i$. 

__Aperiodic__: A state is aperiodic if $d_i = 1$. A Markov chain is aperiodic if all of its states are aperiodic. 

__Stationary distribution__: A row vector $pi = (pi_1, pi_2, ..., pi_(|S|))$  is the equilibrium (aka stationary) distribution of the Markov chain if:
1. $pi_i gt.eq 0,  forall i in S$
2. $sum_(i in S) pi_i = 1$
3. $pi P = pi$ (balance equations)

A Markov Chain has a unique stationary distribution if and only if it is irreducible and positive-recurrent.

An irreducible Markov chain with a unique stationary distribution $pi$ statisfies $pi_i = mu_i^(-1)$, $forall i in S$. 

__Ergodic__: A finite Markov chain is ergodic if it is irreducible and aperiodic. An infinite Markov chain is ergodic if it is irreducible, aperiodic, and positive-recurrent. For an ergodic Markov chain, the long-term time spent in any state equals the probability defined by its unique stationary distribution:
$$
lim_(t arrow infinity) eta(i, t) / t = pi(i)
$$
where $eta(i, t)$ is the number of visits to state $i$ in $t$ steps. 

__Detailed balance__: Detailed balance says that for every pair of states $i, j$, the probability of going from $i arrow j$ is equivalent to the probability of going from $j arrow i$. $pi(i)P(i, j) = pi(j) P(j, i), forall "states" i != j$ 

Solving the detailed balance equations shows $pi$ is a stationary distribution; therefore, detailed balance implies global balance.

### Literature

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

2. Calculate the energy and accept the proposal with probability $min (1,  exp (- (Delta E )/ ( k T )))$

3. Compute the average, where $F_j$ is the value $F$ after the $j^"th"$ move 
$$overline(F) = 1/M sum_(j = 1)^M F_j$$

Because each particle can move to any point with finite probability, each state can communicate with each other, proving irreducibility.

Because it is possible to reject a proposal, it is possible to remain at the current state, so the period of the chain is 1, proving aperiodicity. 

In order to prove ergodicity, we need to show that the distribution is positive recurrent, which we can show by satisfying the detail balance equations. Consider two states $r$ and $s$, where without loss of generality, $s$ has lower energy than $r$. By construction, transitioning to a state is weighted by the probability of proposing that state and accepting it. Proposing any state is equally likely in this setup, so $P_(r s) = P_(s r)$. Accepting a state is asymmetric, where we always accept moving to lower energy states. 

Hence, we must find $pi$ that solves detailed balance: $$
pi_s * P_(s r) * 1 &= pi_r * P_(r s) * exp(-(E_s - E_r)/ (k T))  \ 
pi_s &= pi_r * exp(-(E_s - E_r)/ (k T)) \
pi_s / pi_r &= exp(-(E_s - E_r)/ (k T)) 
$$ 

The solution to this is $pi_r = 1 / Z exp(-E_r / (k T))$, where $Z$ is a function that normalizes the total probability across all states to 1. 

Therefore, we've proven ergodicity, so the average value of the property in our random walk MC computed over a long time horizon approaches the expected value of the property. 

__[Hastings (1970)](https://www.dpye.iimas.unam.mx/soriano/BAYES/DOCUMENTOS/NOTAS/HASTINGS.pdf)__

MC methods require sampling from high-dimensional probability distributions, which may be difficult and computationally expensive. 

Some methods to sample from such distributions are:

1. If possible, factorizing the distribution into the product of "easier" one-dimensional distributions from which samples can be obtained

2. Use importance sampling. Consider PDF $p(x)$ that is difficult to sample from^[Computers natively generate uniform random numbers $cal(U)(0, 1)$, so we use inverse transform sampling to sample from complex distributions. This requires computing the inverse of the desired CDF, which is often analytically impossible.]. MC algorithm would require us to obtain $x_i ~ p(x)$ and estimate $hat(J)_1 = 1/N sum_i f(x_i)$. Instead, we sample from an easier distribution $q(x)$^[Derivation:
$J &= E_p [f(x)] \ &= integral f(x) p(x) \ &= integral f(x) p(x) q(x) / q(x) &= E_q [f(x) p(x) / q(x)]]$
]. So we can compute $hat(J)_2 = 1/N sum_i f(x_i)p(x_i)/q(x_i)$. However, the values of the weights $w(x_i) = p(x_i) / q(x_i)$ for reasonable values of $N$ may all be extremely small or few be extremely large. 

The Metropolis-Hastings algorithm seeks to sample from a desired probability distribution $p(x)$ by generating a Markov chain that asymptotically reaches a unique stationary distribution $pi(x)$ such that $pi(x) = p(x)$. 

We do this by constructing a Markov chain that is aperiodic, positive-recurrent, and exhibits detailed balance (a necessary but sufficient condition for the existence of a stationary distribution). Thus, this constructed Markov chain will have a unique stationary distribution, which we will set to $p(x)$. 

The Metropolis-Hastings algorithm associated with a target density $pi$ requires the choice of an easier density $q$ (aka proposal or candidate kernel). Given $X^(t) = x^((t))$ and $pi(x) prop tilde(pi)(x)$^[Assuming the target distribution can only be computed up to a multiplying constant.], 
1. Generate $Y_t ~ q(y|x^((t)))$
2. Take 
$$X^(t+1) = cases(
  Y_t & "with probability" rho(x^((t)), Y_t),
  x^((t)) & "with probability" 1 - rho(x^((t)), Y_t),
) \
"where" rho(x, y) =min{ frac(tilde(pi)(y), tilde(pi)(x)) frac(q(x | y), q(y | x)), 1 }
$$



The choice of $q$ is flexible, but the choice affects its ability to converge to the target density $p$. 
