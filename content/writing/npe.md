# Neural Posterior Estimation

## The posterior problem

The canonical problem that all of Bayesian inference tries to solve: how can we update our model given the data we've seen so far?

Let $x$ represent our data and $theta$ represent the parameters of our model. From Bayes' theorem, we have: $$p(theta|x) = p(theta, x)/p(x) = (p(x|theta)p(theta))/p(x)$$ 

All of Bayesian inference is about the posterior probability $p(theta|x)$, which tells us how to update our model parameters based on the data we've observed. By construction, we have access to the distribution of the model parameters, so we won't worry too much about modeling the prior $p(theta)$. However, the likelihood $p(x|theta)$ and marginal $p(x)$^[$p(x) = integral_theta p(x|theta) p(theta) d theta$] are often intractable to model given sufficiently complex models parameterized by $theta$. 

## Simulation-based inference

The main idea of SBI is that we can estimate the posterior distribution directly using "simulations" of the model without having to compute the intractable likelihood function. 

At a high level, this is how it works:
1. We sample the prior: $theta_i ~ p(theta)$
2. Run the simulator to generate synthetic datasets $(x_i, theta_i)$: $x_i ~ p(x_i|theta_i)$. Now, we have a dataset of $N$ samples ${(x_i, theta_i)}_(i=1,..., N)$ drawn from the joint distribution $p(theta, x) = p(theta)p(x|theta)$. 
3. We train a neural density network, which takes the $x_i$ as input and learns to predict the distribution of the $theta_i$ that generated it
4. Feed the observed data $x_o$ to the neural density network to get the approximated posterior distribution $p(theta|x_o)$

## Neural density network
We refer to the inference network as $q_phi.alt (theta|x)$, where $theta$ are the parameters of the neural network. We train the network by minimizing the cross-entropy loss^[Intuitively, the cross-entropy loss measures the total average surprise when you use $q_phi.alt$ to navigate the true landscape $p$. ] between the true posterior and the approximated posterior: $$cal(L) (phi.alt) = bb(E)_((theta, x) ~ p(theta, x)) [-log q_phi.alt (theta|x)]$$

