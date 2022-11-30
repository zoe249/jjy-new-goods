function modalResult(event) {
	const {
		result
	} = event.currentTarget.dataset;
	const page = getCurrentPages();
	const currPage = page[page.length - 1];

	currPage.setData({
		modalData: {
			showFlag: false,
		}
	});

	return result === '1';
}

export {
	modalResult,
}
