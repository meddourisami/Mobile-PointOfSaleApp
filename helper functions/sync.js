// const syncDataWithServer = async () => {
        //     try {
                
        //         //const changes = await db.getAllAsync(`SELECT * FROM CustomerLocalLogs;`);
                
        //         //await Promise.all(changes.map(async (change) => {

        //             let data={
        //                ...JSON.parse(change.data),
        //                doctype:"Customer",
        //                __islocal: 1,
        //                owner: "Administrator",
        //             }
        //             //console.log(data);
        //                 //console.log("change.data",change.data?.name)
        //                 console.log("data", JSON.stringify({
        //                      "doc": JSON.stringify(data),  
        //                      "action": "Save"
        //                 }))
        //             let jsonString = JSON.stringify(change.data);
        //             let response;
        //             try {
        //                 if (change.action === 'INSERT') {
        //                     console.log(JSON.stringify(data))
        //                     response = await fetch(
        //                         'http://195.201.138.202:8006/api/method/frappe.desk.form.save.savedocs',
        //                         {
        //                             method: 'POST',
        //                             headers: {
        //                                 'Content-Type': 'application/json',
        //                                 'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c'
        //                             },
        //                             body: JSON.stringify({
        //                                 "doc": JSON.stringify(data),  
        //                                 "action": "Save"
        //                             })
        //                         }
        //                     );
                          
        //                 } else if (change.action === 'UPDATE') {
        //                     response = await fetch(
        //                         `http://195.201.138.202:8006/api/method/frappe.desk.form.save.savedocs`,
        //                         {
        //                             method: 'POST',
        //                             headers: {
        //                                 'Content-Type': 'application/json',
        //                                 'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c'
        //                             },
        //                             body: {
        //                                 doc: change.data,
        //                                 action: 'Update'
        //                             }
        //                         }
        //                     );
                        
        //                 } else if (change.action === 'DELETE') {
        //                     response = await fetch(
        //                         `//**********DELETE ENDPOINT***********//`,
        //                         {
        //                             method: 'DELETE',
        //                             headers: {
        //                                 'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c'
        //                             }
        //                         }
        //                     );
        //                 }
        //                 if (response.ok) {

        //                     await db.runAsync(`DELETE FROM CustomerLocalLogs WHERE id = ?`, [change.id]);
        //                     console.log("Successfully synchronized changes");

        //                 } else{

        //                     console.log('Error from server:', await response.text());
        //                 }

        //             } catch (error) {
        //                 console.log('Network error:', error);
        //             }
        //           //  })
        //         //);
        //     } catch (e) {
        //         console.log('Error syncing data with server', e);
        //     }
        // };
