const stars = document.querySelector(".rating").children;

const ratingValue = document.querySelector("#rating-value");

let index;

for(let i=0; i < stars.length; i++) {
	stars[i].addEventListener("mouseover",() => {
  	for(let j=0; j<stars.length; j++) {
    	stars[j].classList.remove("fa-star");
    	stars[j].classList.add("fa-star-o");
    }
  	for(let j=0; j<=i; j++){
    	stars[j].classList.remove("fa-star-o");
    	stars[j].classList.add("fa-star");
    }
  });
  
  stars[i].addEventListener("click",() => {
    ratingValue.value = i + 1;
    console.log(i);
    index=i;
  });
  
  stars[i].addEventListener("mouseout", () => {
  	for(let j=0; j<stars.length; j++) {
    	stars[j].classList.remove("fa-star");
    	stars[j].classList.add("fa-star-o");
    }
  	for(let j=0; j<=index; j++){
    	stars[j].classList.remove("fa-star-o");
    	stars[j].classList.add("fa-star");
    }
  });
}