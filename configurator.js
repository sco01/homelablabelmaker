$( function() {

  var disk_type = $( "#disk_type" ),
  capacity = $( "#capacity" ),
  serial = $( "#serial" ),
  vendorType = 'hp';

  // First, checks if it isn't implemented yet.
  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
      });
    };
  }

  function hpTypeToColor(type,speed,obj) {
    diskSpeedObj = obj.find('.speed');
    diskTypeObj  = obj.find('.interface');
    labelDivider = obj.find('.divider');
      
    switch (true) {
      case /^SAS$/gi.test(type):
        labelDivider.addClass('hpPurple'); break;
      case /^(SAS MDL|SATA|SATA MDL)$/gi.test(type):
        labelDivider.addClass('hpCyan'); break;
      case /^Fibre Channel$/gi.test(type):
        labelDivider.addClass('hpOrange'); break;
      case /^SSD$/gi.test(type):
        labelDivider.addClass('hpWhite'); break;
      case /SSNW/gi.test(type):
        labelDivider.addClass('hpSSNW'); break;
    }

    if ( !/(DP|Dual|Dual Port)/.test(speed)) {
      console.info ('This is a non DP Disk (' + type + ')');

      diskSpeedObj.addClass('nonDP');
    }
    
    if (/SSD/.test(type) && vendorType !== 'dell') { diskTypeObj.text(String.fromCharCode(160)); }

  }

  function addUser(e, formFactor = false, interfaceType = false, interfaceSpeed = false, diskSpeed = false, diskType = false, diskCapacity = false, diskSerial = false, targetTable = 'printOutTable', targetNumber = 6 ) {
    diskSpeedLabel = '';
    diskSpeedDell  = '';

    console.info (formFactor)

    formFactor      = formFactor      === false ? $('#formFactor label.ui-checkboxradio-checked').attr('for')     : formFactor;
    interfaceType   = interfaceType   === false ? $('#interfaceType label.ui-checkboxradio-checked').attr('for')  : interfaceType;
    interfaceSpeed  = interfaceSpeed  === false ? $('#interfaceSpeed label.ui-checkboxradio-checked').attr('for') : interfaceSpeed;
    diskSpeed       = diskSpeed       === false ? $('#diskSpeed label.ui-checkboxradio-checked').attr('for')      : diskSpeed;
    diskType        = diskType        === false ? $('#diskType label.ui-checkboxradio-checked').text()            : diskType;
    diskCapacity    = diskCapacity    === false ? capacity.val()                                                  : diskCapacity;
    diskSerial      = diskSerial      === false ? serial.val()                                                    : diskSerial;

    console.info ('FF: ' + formFactor + ' -- IF: ' + interfaceType + ' -- IFS: ' + interfaceSpeed + ' -- DSp: ' + diskSpeed + ' -- DT: ' + diskType + ' -- DC: ' + diskCapacity + ' -- DSe: ' + diskSpeed + ' -- TT: ' + targetTable + ' -- TN: ' + targetNumber);
    console.warn ($('#' + targetTable + ' tr').length);

    switch (interfaceSpeed) {
      case 'SATA2/SAS':
        if (/SATA/.test(diskType)){
          diskSpeedLabel = diskSpeedLabel.concat('3G ');
        }
        break;
      case 'SATA3/SAS2':
        diskSpeedLabel = diskSpeedLabel.concat('6G '); break;
      case 'SAS3':
        diskSpeedLabel = diskSpeedLabel.concat('12G '); break;
      case 'SAS4':
        diskSpeedLabel = diskSpeedLabel.concat('22G '); break;
    }

    if (interfaceType === 'dualPort') {
      if (diskSpeedLabel === '') {
        diskSpeedLabel = diskSpeedLabel.concat('Dual Port ');
      } else {
        diskSpeedLabel = diskSpeedLabel.concat('DP ');
      }
    }

    if (diskSpeed) {
      diskSpeedLabel = diskSpeedLabel.concat(diskSpeed);
      diskSpeedDell  = diskSpeedDell.concat(diskSpeed);
    }

    if (/(SSD|SSNW)/i.test(diskType)) {
      diskSpeedLabel = 'SATA SSD';
    }

    var valid = true;

    switch (vendorType) {
      case 'hp': 
        console.info ('Disk Speed HP Label : ' + diskSpeedLabel);
        switch (formFactor) {
          case 'SFF':
            labelString = "<div class='hp SFF'><div class='speed'>{0}</div><div class='interface divider'>{1}</div><div class='capacity'>{2}</div><div class='serial'>{3}</div></div>".format(diskSpeedLabel,diskType,diskCapacity,diskSerial);
            break;
          case 'LFF':
            labelString = "<div class='hp LFF'><div class='speed'>{0}</div><div class='interface'>{1}</div><hr class='divider'/><div class='capacity'>{2}</div><div class='serial'>{3}</div></div>".format(diskSpeedLabel,diskType,diskCapacity,diskSerial);
          break;
        }
        break;
      case 'dell':
        console.info ('Disk Speed Dell Label : ' + diskSpeedDell);
        switch (formFactor) {
          case 'SFF':
            labelString = "<div class='dell SFF'><div class='interface'>{0}</div><div><span class='capacity'>{1}</span> <span class='speed'>{2}</span></div></div>".format(diskType,diskCapacity,diskSpeedDell);
            break;
          case 'LFF':
            labelString = "<div class='dell LFF'><div class='interface'>{0}</div><div class='capacity'>{1}</div><div class='speed'>{2}</div></div>".format(diskType,diskCapacity,diskSpeedDell);
          break;
      }
    }
     
    if (($('#' + targetTable + ' tr').length === 0) || $('#' + targetTable + ' tr:last td').length >= targetNumber) { $( '#' + targetTable + ' tbody' ).append( '<tr>' ); }
    $( '#' + targetTable + ' tbody tr:last' ).append('<td>' + labelString + '</td>');
    if (($('#' + targetTable + 'tr').length === 0) || $('#' + targetTable + ' tr:last td').length >= targetNumber) { $( '#' + targetTable + ' tbody' ).append( '</tr>' ); }

    hpTypeToColor(diskType,diskSpeedLabel,$( '#' + targetTable + ' tbody tr td' ).last());

    /* Dell SSD fix */
    if (/SSD/i.test(diskType) && vendorType === 'dell' && formFactor === 'SFF') {
      console.info ('Dell SSD Fix');
      $('#' + targetTable + ' td .dell.LFF .speed').last().remove();
      $('#' + targetTable + ' td .dell.LFF .capacity').last().css({'line-height': '0.8cm'})
    }

    if($('#addMore:checked').length === 0) {
      dialog2.dialog( "close" );
    }
  }

  dialog2 = $( "#dialog-form" ).dialog({
    autoOpen: false,
    height: 400,
    width: 350,
    modal: true,
    buttons: {
      "Add disk(s)": addUser,
      Cancel: function() {
        dialog2.dialog( "close" );
      }
    },
    close: function() {
      form[ 0 ].reset();
    }
  });

  dialog = $( "#vendor-select" ).dialog({
    autoOpen: false,
    height: 200,
    width: 350,
    modal: true,
    close: function() {
    }
  });


  form = dialog2.find( "form" ).on( "submit", function( event ) {
    event.preventDefault();
    btnPrintPage;
  });

  $( "#btnStartConfigurator" ).button().on( "click", function() {
    dialog.dialog( "open" );
  });

  $( "#btnPrintPage" ).button().on( "click", function() {
    preparePrint();
    window.print();
  });

  $( "#btnRestartApp" ).button().on( "click", function() {
    $( "#btnPrintPage" ).show();
    $( "#btnStartConfigurator" ).show();
    $( '#exampleContainer').show();
    $( '#instruction').show();
    $( '#printOutTable tbody').html('');
    $(this).hide();
  }).hide();

  $('table#vendors img').click(function(e) {
    dialog.dialog( "close" );
    console.info($(this).attr('id') + ' Clicked!');
    vendorType = $(this).attr('id');
    if ($(this).attr('id') === 'dell') {
      $('#interfaceType').hide();
      $('#interfaceSpeed').hide();
      $('label[for=\'SASMDL\']').hide();
      $('label[for=\'SATAMDL\']').hide();
      $('label[for=\'FC\']').hide();
      $('label[for=\'SSNW\']').hide();
    }
    dialog2.dialog( "open" );
  });

  $('#disk_type').change(function alma() {
    console.log ('Disk Typpe changed. New Type: ' + $(this).val());
    if (/SSD/gi.test($(this).val())) {
      $('#disk_speed').val('SATA SSD').prop('disabled', true).css('color', '#A0A0A0');
    } else {
      $('#disk_speed').prop('disabled', false).css('color', '#333333');
    }
  });

  $('#dialog-form input:radio').checkboxradio({
    icon: false
  });

  $('#addMore').checkboxradio();

  $( "[name='diskType']").on("change", function(e) {
    var target = $( e.target );
    var checked = target.is( ":checked" );

    if (target.attr('id') === 'SSD' && checked ) {
      $('#diskSpeed').hide();
      $('#diskSpeed label').removeClass('ui-checkboxradio-checked ui-state-active')
    } else {
      $('#diskSpeed').show();
      $('[for=\'' + $('[name=\'diskSpeed\']:checked').attr('id') + '\']').addClass('ui-checkboxradio-checked ui-state-active')
    }
  });

  function preparePrint() {
    $( "#btnPrintPage" ).hide();
    $( "#btnStartConfigurator" ).hide();
    $( '#exampleContainer').hide();
    $( '#instruction').hide();
    setTimeout(function() {
      $( '#btnRestartApp').show();
    },1000);
  }

  function generateExample() {
    examples = {
      hpSFF: {
        title: 'HP 2.5" (SFF)',
        vendorType: 'hp',
        fields: [
          {formFactor: 'SFF', interfaceType: 'dualPort', interfaceSpeed: 'SATA2/SAS', diskSpeed: '15K', diskType: 'SAS', diskCapacity: '146 GB', diskSerial: 'SPARE 512744-001'},
          {formFactor: 'SFF', interfaceType: 'dualPort', interfaceSpeed: 'SATA3/SAS2', diskSpeed: '7.2K', diskType: 'SAS MDL', diskCapacity: '500 GB', diskSerial: 'SPARE 508009-001'},
          {formFactor: 'SFF', interfaceType: 'singlePort', interfaceSpeed: 'SATA3/SAS2', diskSpeed: '7.2K', diskType: 'SATA', diskCapacity: '1 TB', diskSerial: 'SPARE 123456-789'},
          {formFactor: 'SFF', interfaceType: 'singlePort', interfaceSpeed: '', diskSpeed: '', diskType: 'SSD', diskCapacity: '400 GB', diskSerial: 'SPARE 690811-002'},
          {formFactor: 'SFF', interfaceType: 'dualPort', interfaceSpeed: 'SATA2/SAS', diskSpeed: '15K', diskType: 'Fibre Channel', diskCapacity: '1 TB', diskSerial: 'SPARE 123456-789'},
          {formFactor: 'SFF', interfaceType: 'singlePort', interfaceSpeed: '', diskSpeed: '', diskType: 'SSD SSNW', diskCapacity: '1 TB', diskSerial: 'SPARE 123456-789'},
        ]
      },
      hpLFF: {
        title: 'HP 3.5" (LFF)',
        vendorType: 'hp',
        fields: [
          {formFactor: 'LFF', interfaceType: 'dualPort', interfaceSpeed: 'SATA2/SAS', diskSpeed: '15K', diskType: 'SAS', diskCapacity: '1 TB', diskSerial: 'SPARE 123456-789'},
          {formFactor: 'LFF', interfaceType: 'dualPort', interfaceSpeed: 'SATA3/SAS2', diskSpeed: '7.2K', diskType: 'SAS MDL', diskCapacity: '4 TB', diskSerial: 'SPARE 123456-789'},
          {formFactor: 'LFF', interfaceType: 'singlePort', interfaceSpeed: 'SATA3/SAS2', diskSpeed: '5.4K', diskType: 'SATA', diskCapacity: '3 TB', diskSerial: 'SPARE 123456-789'},
          {formFactor: 'LFF', interfaceType: 'singlePort', interfaceSpeed: '', diskSpeed: '', diskType: 'SSD', diskCapacity: '512 GB', diskSerial: 'SPARE 123456-789'},
          {formFactor: 'LFF', interfaceType: 'dualPort', interfaceSpeed: 'SATA2/SAS', diskSpeed: '15K', diskType: 'Fibre Channel', diskCapacity: '1 TB', diskSerial: 'SPARE 123456-789'},
          {formFactor: 'LFF', interfaceType: 'singlePort', interfaceSpeed: '', diskSpeed: '', diskType: 'SSD SSNW', diskCapacity: '1 TB', diskSerial: 'SPARE 123456-789'},
        ]
      },
      dellSFF: {
        title: 'Dell 2.5" (SFF)',
        vendorType: 'dell',
        fields: [
          {formFactor: 'SFF', interfaceType: '', interfaceSpeed: '', diskSpeed: '7.2K', diskType: 'SATA', diskCapacity: '512 GB', diskSerial: ''},
          {formFactor: 'SFF', interfaceType: '', interfaceSpeed: '', diskSpeed: '5.4K', diskType: 'SATA', diskCapacity: '1 TB', diskSerial: ''},
          {formFactor: 'SFF', interfaceType: '', interfaceSpeed: '', diskSpeed: '10K', diskType: 'SATA', diskCapacity: '2 TB', diskSerial: ''},
          {formFactor: 'SFF', interfaceType: '', interfaceSpeed: '', diskSpeed: '15K', diskType: 'SATA', diskCapacity: '146 GB', diskSerial: ''},
          {formFactor: 'SFF', interfaceType: '', interfaceSpeed: '', diskSpeed: '', diskType: 'SSD', diskCapacity: '256 GB', diskSerial: ''},
          {formFactor: 'SFF', interfaceType: '', interfaceSpeed: '', diskSpeed: '', diskType: 'SSD', diskCapacity: '512 GB', diskSerial: ''},
        ]
      },
      dellLFF: {
        title: 'Dell 3.5" (LFF)',
        vendorType: 'dell',
        fields: [
          {formFactor: 'LFF', interfaceType: '', interfaceSpeed: '', diskSpeed: '15K', diskType: 'SAS', diskCapacity: '1 TB', diskSerial: ''},
          {formFactor: 'LFF', interfaceType: '', interfaceSpeed: '', diskSpeed: '10K', diskType: 'SAS', diskCapacity: '2 TB', diskSerial: ''},
          {formFactor: 'LFF', interfaceType: '', interfaceSpeed: '', diskSpeed: '7.2K', diskType: 'SATA', diskCapacity: '4 TB', diskSerial: ''},
          {formFactor: 'LFF', interfaceType: '', interfaceSpeed: '', diskSpeed: '5.4K', diskType: 'SATA', diskCapacity: '8 TB', diskSerial: ''},
          {formFactor: 'LFF', interfaceType: '', interfaceSpeed: '', diskSpeed: '', diskType: 'SSD', diskCapacity: '512 GB', diskSerial: ''},
          {formFactor: 'LFF', interfaceType: '', interfaceSpeed: '', diskSpeed: '', diskType: 'SSD', diskCapacity: '1 TB', diskSerial: ''},
        ]
      }
    };

    for (ff in examples) {
      vendorType = examples[ff].vendorType;
      fields = examples[ff].fields;

      $('table#exampleTable tbody').last().append('<tr><td>' + examples[ff].title + '</td>');

      for (item in fields) {
        example = fields[item];
        addUser($(this),example.formFactor,example.interfaceType, example.interfaceSpeed,example.diskSpeed,example.diskType,example.diskCapacity,example.diskSerial,'exampleTable', 7);
      }

      $('table#exampleTable tbody').last().append('</tr>');
    }
  }

  generateExample();
});