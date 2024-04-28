"use strict";
function hcr(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
}

$(document).ready( () => {
	// show current year
	
	var fetched_subjects = [];
	Service.Categories =  () => {
		$('#available-categories').change(function(e){
			var value = e.target.value.split("+")
			console.log("selected",e.target.value,value);
			var selected = $("#selected-units").val()
			
			var selectedids = $('#hm-inpt-modal-c2').val();
			if(selected.includes(value[1])){
				selected.replace(value[1]+",","")
				selectedids.replace(value[0]+",","")
				$('#hm-inpt-modal-c2').val(selectedids);
				$("#selected-units").val(selected)
			}else{
				selected += value[1]+","
				selectedids+= value[0]+","
				$('#hm-inpt-modal-c2').val(selectedids);
				$("#selected-units").val(selected)
			}
			e.target.value = null
			let str = $('#hm-inpt-modal-c2').val()
			let lastIndex = str.lastIndexOf(',');
			if (lastIndex !== -1) {
				let modifiedStr = str.substring(0, lastIndex) + str.substring(lastIndex + 1);
				$('#hm-inpt-modal-c2').val(modifiedStr)
				// console.log(modifiedStr);
			}else{
				$('#hm-inpt-modal-c2').val(str+",")
			}
		});
		$.getJSON(Path.gate('categories',null,''),  (data) => {
			console.log(data);
			if (jQuery.isEmptyObject(data)) {
				 //console.log('yes');
				 //$('.hm-mv-categories').empty();
			}else{
				
				$('.hm-mv-categories').empty();
				//$('#available-categories').empty();
				$.each(data,  (key, val) => {
						fetched_subjects.push({id:val._id,name:val.name})
						$('#available-categories').append(`<option value="${val._id}+${val.name}">${val.name}</option>`);
						$('.hm-mv-categories').append( `<tr class="${val._id}_off"> <td class="ng-binding">${val.name}</td>  <td class="ng-binding">${val.createdAt}</td> <td class="ng-binding">${val.status}</td> <td class="no-print"  onclick="Service.del(\'${val._id}\' , \'categories\');"><a  md-ink-ripple="" class="md-btn md-raised pull-left p-h-md red ${val._id}_btn">Delete</a></td></tr>`);
				 });
			}
		});
	}
	
	
  // dispaly supported terms
	Service.Categories();
	
	Service.Products =  () => {
		$.getJSON(Path.gate('products',null,''),  (data) => {
			//$(".eml").empty() // clear all HTML in the div before we start printing chat messages
			if (jQuery.isEmptyObject(data)) {
				 //console.log('yes');
				  $('.hm-mv-products').empty();
			}else{
			
 		    $('.hm-mv-products').empty();
				$.each(data.products,  (key, val) => {
						for(var dt of fetched_subjects){
						   if(dt.id){
							   val.categories[val.categories.indexOf(dt.id)] = dt.name
						   }
					    }
						val.categories = val.categories.join(",")
						$('.hm-mv-products').append(`
							<tr class="${val._id}_off">
								<th scope="row"><img src='${val.img}' class="blur-up lazyloaded"></th>
								<td>${val.title}</td>
								<td>${val.categories}</td>
								<td class="fw-bold text-theme">${val.price}</td>
								<td>${val.units}</td>
								<td>0</td>
								<td>
									<a href="javascript:void(0)"><i class="fas fa-pencil-square me-1" aria-hidden="true"></i></a>
									<a href="javascript:void(0)" onclick="Service.del(\'${val._id}\' , \'products\');"><i class="fas fa-trash ms-1 text-theme" aria-hidden="true"></i></a>
								</td>
							</tr>
						`);
				 });
			}
		});
	}
  // dispaly supported terms
	Service.Products();
	
	Service.Orders =  () => {
		$.getJSON(Path.gate('orders',null,''),  (data) => {
			if (jQuery.isEmptyObject(data)) {
				 //console.log('yes');
				 $('.hm-mv-orders').empty();
			}else{
				
				$('.hm-mv-orders').empty();
				$.each(data.orders,  (key, val) => {
					$('.hm-mv-orders').append( `
						<tr>
							<th scope="row">#${val.order._id}</th>
							<td>${val.user.name}</td>
							<td><span class="badge rounded-pill bg-success-10 text-success custom-badge">${val.order.status}</span>
							</td>
							<td>${val.order.amount}</td>
						</tr>
					`);
				 });
			}
		});
	}

	Service.Orders();
	Service.Income =  () => {
		$.getJSON(Path.gate('orders',null,'/income'),  (data) => {
			if (jQuery.isEmptyObject(data)) {
				 //console.log('yes');
			}else{
				//console.log(data)
				$('.hm-recent-orders').empty();
				$('.hm-trending-products').empty();
				$('.hm-total-products').text(data.products.length);
				$('.hm-total-orders').text(data.orders.length);
				$('.hm-total-pending').text(data.pending.length);
				$('.hm-total-sales').text(data.amount);
				var i = 0
				$.each(data.orders,  (key, val) => {
					//if(i > 5){break}
					i+=1
					$('.hm-recent-orders').append( `
						<tr>
							<th scope="row">#${val._id}</th>
							<td>${val.userId}</td>
							<td><span class="badge rounded-pill bg-success-10 text-success custom-badge">${val.status}</span>
							</td>
						</tr>
					`);
				});
				i = 0
				$.each(data.products,  (key, val) => {
					//if(i > 5){break}
					i+=1
					$('.hm-trending-products').append( `
						<tr>
							<th scope="row"><img src="/assets/images/dashboard/product/1.jpg" class="blur-up lazyloaded"></th>
							<td>${val.title}</td>
							<td>${val.price}</td>
							<td>1000</td>
						</tr>
					`);
				});
				Service.roundedChart("chart-order",["Recent Orders","Pending Payments","Recieved Payments"],[data.invoice,data.invoice-data.amount,data.amount])
			}
		});
	}

	Service.Income();
	console.log(fetched_subjects)
})

function hm_v_s_units(x,y,z) {
	console.log(x,y,z)
  var dx ;
	$('.hm-mv-'+z+'').empty();
	dx = x.split(',');
	if (dx === null || dx === '') {
		 $('.hm-srch-str-units').hide('slow');
		 $('.hm-mv-'+z+'').append(`<tr><td>${y}</td><td>Main</td></tr>`);
	}else{
		$('.hm-srch-str-units').show('slow');
		$.each(dx,  (key, val) => {
			if(val === ''){return true}
			$('.hm-mv-'+z+'').append(`<tr><td>${val}</td><td><span class="btn btn-default  btn-sm"><i class="mdi-action-delete text-danger text-md "></i></span></td></tr>`);
	 });
	}
	$('.hm-modal-edit-'+z+'-hd').html(y);
	$('.hm-modal-edit-'+z+'').modal('show');
}


// REMOVE DATA FROM ANY HILMACS DOCUMENT
Service.del = (a,b) => {
	// hilmacs default comment
	$.delete(Path.gate(b,null,'/'+a)).always( () => {
     $('.'+a+'_btn').removeClass('red');
		 $('.'+a+'_btn').addClass('yellow');
		 $('.'+a+'_btn').html(hcr('loaderIcon_sm')+' Discarding');
	}).done( () => {
		// control view
		$('.'+a+'_off').hide(2000);
	}).fail( () => {
		alert('Account Deletion failed');
	});
}


//CHANGE ACCOUNT State
Service.chgState = (a,b,c) => {
		// hilmacs default comment
	 $.get(Path.gate(b,null,'update/'), {'id':a , 'val':c}).always( () => {
			 if (c == 1 ) {
				 $('.btn-'+a).removeClass('btn-danger');
				 $('.btn-'+a).addClass('btn-info');
	 			 $('.hm-acc-state-'+a).removeClass('mdi-action-lock');
	 			 $('.hm-acc-state-'+a).addClass('mdi-action-lock-open');
	       Service.html('.state-'+a,'In active');
			 } else {
			   $('.btn-'+a).addClass('btn-danger');
				 $('.btn-'+a).removeClass('btn-info');
				 Service.html('.state-'+a,'Active');
			 }
	 }).fail( () => {
		 console.log('failed Deactivating...');
	 });
}

Service.lineChart = (id,data) =>{
	console.log("in")
	const xValues = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

	new Chart(id, {
	type: "line",
		data: {
			labels: xValues,
			datasets: [{
			data:data[0],
			borderColor: "red",
			fill: false,
			title:"Recent"
			},{
			data: data[1],
			borderColor: "green",
			fill: false,
			title:"Pending"
			},{
			data: data[2],
			borderColor: "green",
			fill: false,
			title:"Recieved"
			}]
		},
		options: {
			legend: {display: false}
		}
	});
	return true
}

Service.roundedChart = (id,labels,data) =>{
	console.log("in")
	const xValues = labels;
	const yValues = data;
	const barColors = ["red", "green","blue","orange","brown"];
	new Chart(id, {
		type: "doughnut",
		data: {
		  labels: xValues,
		  datasets: [{
			backgroundColor: barColors,
			data: yValues
		  }]
		},
		options: {
		  title: {
			display: true,
			
		  }
		}
	  });
	return true
}

