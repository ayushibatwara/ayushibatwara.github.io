# Scientific modeling and robustness

These notes are based on __[Box (1980)](https://academic.oup.com/jrsssa/article/143/4/383/7105478)__^[I also found the [discussion](https://rss.onlinelibrary.wiley.com/doi/epdf/10.1111/j.2397-2327.1980.tb04199.x) of his paper to be quite interesting. One of the points is about Box's emphasis on looking for "robust samples" rather than "robust procedures" and how non-robust samples have an effect on the inference drawn upon it.].

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
